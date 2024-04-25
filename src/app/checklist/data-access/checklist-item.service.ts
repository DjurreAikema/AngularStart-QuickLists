import {AddChecklistItem, ChecklistItem, EditChecklistItem, RemoveChecklistItem} from "../../shared/interfaces/checklist-item";
import {computed, effect, inject, Injectable, Signal, signal} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RemoveChecklist} from "../../shared/interfaces/checklist";
import {StorageService} from "../../shared/data-access/storage.service";
import {ChecklistService} from "../../shared/data-access/checklist.service";

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
// Responsibility: Handle the state for all checklist items
export class ChecklistItemService {
  private storageService: StorageService = inject(StorageService);
  private checklistService: ChecklistService = inject(ChecklistService);

  // --- State
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
    error: null
  });

  // --- Selectors
  public checklistItems: Signal<ChecklistItem[]> = computed(() => this.state().checklistItems);
  public loaded: Signal<boolean> = computed(() => this.state().loaded);

  // --- Sources
  public add$: Subject<AddChecklistItem> = new Subject<AddChecklistItem>();
  public edit$: Subject<EditChecklistItem> = new Subject<EditChecklistItem>();
  public remove$: Subject<RemoveChecklistItem> = new Subject<RemoveChecklistItem>();
  public toggle$: Subject<RemoveChecklistItem> = new Subject<RemoveChecklistItem>();
  public reset$: Subject<RemoveChecklist> = new Subject<RemoveChecklist>();

  private checklistRemoved$ = this.checklistService.remove$;
  private checklistItemsLoaded$: Observable<ChecklistItem[]> = this.storageService.loadChecklistItems();

  // --- Reducers
  constructor() {
    // checklistItemsLoaded reducer
    this.checklistItemsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklistItems) =>
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true
        })),
      error: (err) => this.state.update((state) => ({...state, error: err}))
    });

    // add$ reducer
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: [
          ...state.checklistItems, // copy all the existing checklist items into the new array
          { // add a new checklist item at the end of the array
            ...checklistItem.item, // supply all the data provided from the `add$` source, and manually override the rest of the properties below
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
    );

    // edit$ reducer
    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id
            ? {...item, title: update.data.title}
            : item
        )
      }))
    );

    // remove$ reducer
    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter((item) => item.id !== id)
      }))
    );

    // toggle$ reducer
    this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? {...item, checked: !item.checked}
            : item
        )
      }))
    );

    // reset$ reduced
    this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId
            ? {...item, checked: false}
            : item
        )
      }))
    );

    // checklistRemoved$ reducer
    this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter((item) => item.checklistId !== checklistId)
      }))
    );

    // --- Effects
    // This effect will save the checklist items to local storage every time the state changes
    effect(() => {
      if (this.loaded()) this.storageService.saveChecklistItems(this.checklistItems());
    });
  }
}

import {AddChecklistItem, ChecklistItem, RemoveChecklistItem} from "../../shared/interfaces/checklist-item";
import {computed, inject, Injectable, signal} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RemoveChecklist} from "../../shared/interfaces/checklist";
import {StorageService} from "../../shared/data-access/storage.service";

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

  // State
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
    error: null
  });

  // Selectors
  public checklistItems = computed(() => this.state().checklistItems);

  // Sources
  public add$ = new Subject<AddChecklistItem>();
  public toggle$ = new Subject<RemoveChecklistItem>();
  public reset$ = new Subject<RemoveChecklist>();

  private checklistItemsLoaded$: Observable<ChecklistItem[]> = this.storageService.loadChecklistItems();

  // Reducers
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

    // add reduced
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

    // toggle reducer
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

    // reset reduced
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
  }
}

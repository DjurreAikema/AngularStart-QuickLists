import {AddChecklistItem, ChecklistItem, EditChecklistItem, RemoveChecklistItem} from "../../shared/interfaces/checklist-item";
import {computed, effect, inject, Injectable, Signal, signal} from "@angular/core";
import {catchError, EMPTY, map, merge, Observable, Subject} from "rxjs";
import {RemoveChecklist} from "../../shared/interfaces/checklist";
import {StorageService} from "../../shared/data-access/storage.service";
import {connect} from "ngxtension/connect";

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

  public checklistRemoved$: Subject<RemoveChecklist> = new Subject<RemoveChecklist>();

  private checklistItemsLoaded$: Observable<ChecklistItem[]> = this.storageService.loadChecklistItems().pipe(
    catchError((err) => {
      this.error$.next(err);
      return EMPTY;
    })
  );
  private error$: Subject<string> = new Subject<string>();

  // --- Reducers
  constructor() {

    const nextState$ = merge(
      // checklistItemsLoaded reducer
      this.checklistItemsLoaded$.pipe(
        map((checklistItems) => ({checklistItems, loaded: true}))
      ),
      // error$ reducer
      this.error$.pipe(map((error) => ({error}))),
    );

    connect(this.state)
      .with(nextState$)
      // add$ reducer
      .with(this.add$, (state, checklistItem) => ({
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
      // edit$ reducer
      .with(this.edit$, (state, update) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id ? {...item, title: update.data.title} : item
        ),
      }))
      // remove$ reducer
      .with(this.remove$, (state, id) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))
      // toggle$ reducer
      .with(this.toggle$, (state, checklistItemId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId ? {...item, checked: !item.checked} : item
        ),
      }))
      // reset$ reducer
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? {...item, checked: false} : item
        ),
      }))
      // checklistRemoved$ reducer
      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter((item) => item.checklistId !== checklistId),
      }));


    // --- Effects
    // This effect will save the checklist items to local storage every time the state changes
    effect(() => {
      if (this.loaded()) this.storageService.saveChecklistItems(this.checklistItems());
    });
  }
}

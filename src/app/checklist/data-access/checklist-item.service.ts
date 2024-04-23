import {AddChecklistItem, ChecklistItem} from "../../shared/interfaces/checklist-item";
import {computed, Injectable, signal} from "@angular/core";
import {Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
}

@Injectable({
  providedIn: 'root'
})
// Responsibility: Handle the state for all checklist items
export class ChecklistItemService {
  // State
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
  });

  // Selectors
  public checklistItems = computed(() => this.state().checklistItems);

  // Sources
  public add$ = new Subject<AddChecklistItem>();

  constructor() {
    // Reducers
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
  }
}

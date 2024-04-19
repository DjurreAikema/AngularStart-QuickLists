import {AddChecklist, Checklist} from "../interfaces/checklist";
import {computed, Injectable, Signal, signal, WritableSignal} from "@angular/core";
import {Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

// State interface
export interface ChecklistState {
  checklists: Checklist[];
}

@Injectable({
  providedIn: 'root',
})
// Responsibility: Handle the state for all checklists
export class ChecklistService {
  // State
  private state: WritableSignal<ChecklistState> = signal<ChecklistState>({
    checklists: [],
  });

  // Selectors
  public checklists: Signal<Checklist[]> = computed(() => this.state().checklists);

  // Sources
  public add$: Subject<AddChecklist> = new Subject<AddChecklist>();

  constructor() {
    // Reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklist) =>
      this.state.update((state) => ({
        ...state,
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
    );
  };

  private addIdToChecklist(checklist: AddChecklist) {
    return {
      ...checklist,
      id: this.generateSlug(checklist.title)
    };
  }

  private generateSlug(title: string) {
    let slug = title.toLowerCase().replace(/\s+/g, '-');

    // Check if the slug already exists
    const matchingSlugs = this.checklists().find(
      (checklist) => checklist.id === slug
    );

    // If the title is already being used, add a string to make the slug unique
    if (matchingSlugs) slug = slug + Date.now().toString();

    return slug;
  }
}

import {AddChecklist, Checklist, EditChecklist, RemoveChecklist} from "../interfaces/checklist";
import {computed, effect, inject, Injectable, Signal, signal, WritableSignal} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {StorageService} from "./storage.service";
import {ChecklistItemService} from "../../checklist/data-access/checklist-item.service";

// State interface
export interface ChecklistState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
// Responsibility: Handle the state for all checklists
export class ChecklistService {
  private storageService: StorageService = inject(StorageService);
  private checklistItemService: ChecklistItemService = inject(ChecklistItemService);

  // --- State
  private state: WritableSignal<ChecklistState> = signal<ChecklistState>({
    checklists: [],
    loaded: false,
    error: null
  });

  // --- Selectors
  public checklists: Signal<Checklist[]> = computed(() => this.state().checklists);
  public loaded: Signal<boolean> = computed(() => this.state().loaded);

  // --- Sources
  public add$: Subject<AddChecklist> = new Subject<AddChecklist>();
  public edit$: Subject<EditChecklist> = new Subject<EditChecklist>();
  public remove$: Subject<RemoveChecklist> = this.checklistItemService.checklistRemoved$;

  private checklistsLoaded$: Observable<Checklist[]> = this.storageService.loadChecklists();

  // --- Reducers
  constructor() {
    // checklistLoaded$ reducer
    this.checklistsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklists) =>
        this.state.update((state) => ({
          ...state,
          checklists,
          loaded: true
        })),
      error: (err) => this.state.update((state) => ({...state, error: err}))
    });

    // add reducer$
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklist) =>
      this.state.update((state) => ({
        ...state,
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
    );

    // edit$ reducer
    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? {...checklist, title: update.data.title}
            : checklist
        )
      }))
    );

    // remove$ reducer
    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.filter((checklist) => checklist.id !== id)
      }))
    );

    // --- Effects
    // This effect will save the checklists to local storage every time the state changes
    effect(() => {
      if (this.loaded()) this.storageService.saveChecklists(this.checklists());
    });
  }

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

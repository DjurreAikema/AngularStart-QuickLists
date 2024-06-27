import {AddChecklist, Checklist, EditChecklist, RemoveChecklist} from "../interfaces/checklist";
import {computed, effect, inject, Injectable, Signal, signal, WritableSignal} from "@angular/core";
import {catchError, EMPTY, map, merge, Observable, Subject} from "rxjs";
import {StorageService} from "./storage.service";
import {ChecklistItemService} from "../../checklist/data-access/checklist-item.service";
import {connect} from "ngxtension/connect";

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

  private checklistsLoaded$: Observable<Checklist[]> = this.storageService.loadChecklists().pipe(
    catchError((err) => {
      this.error$.next(err);
      return EMPTY;
    })
  );
  private error$: Subject<string> = new Subject<string>();

  // --- Reducers
  constructor() {
    const nextState$ = merge(
      // checklistLoaded$ reducer
      this.checklistsLoaded$.pipe(
        map((checklists) => ({checklists, loaded: true}))
      ),
      // error$ reducer
      this.error$.pipe(map((error) => ({error}))),
    );

    connect(this.state)
      .with(nextState$)
      // add reducer$
      .with(this.add$, (state, checklist) => ({
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
      // remove$ reducer
      .with(this.remove$, (state, id) => ({
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
      }))
      // edit$ reducer
      .with(this.edit$, (state, update) => ({
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? {...checklist, title: update.data.title}
            : checklist
        ),
      }));

    // --- Effects
    // This effect will save the checklists to local storage every time the state changes
    effect((): void => {
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
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

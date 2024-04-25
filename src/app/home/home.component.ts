import {Component, effect, inject, signal} from "@angular/core";
import {ModalComponent} from "../shared/ui/modal.component";
import {Checklist} from "../shared/interfaces/checklist";
import {FormBuilder} from "@angular/forms";
import {FormModalComponent} from "../shared/ui/form-modal.component";
import {ChecklistService} from "../shared/data-access/checklist.service";
import {ChecklistListComponent} from "./ui/checklist-list.component";

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>

    <section>
      <h2>Your checklists</h2>
      <app-checklist-list
        [checklists]="checklistService.checklists()"
        (edit)="checklistBeingEdited.set($event)"
        (delete)="checklistService.remove$.next($event)"
      />
    </section>

    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="
                checklistBeingEdited()?.title
                    ? checklistBeingEdited()!.title!
                    : 'Add checklist'
          "
          [formGroup]="checklistForm"
          (close)="checklistBeingEdited.set(null)"
          (save)="
                checklistBeingEdited()?.id
                    ? checklistService.edit$.next({
                        id: checklistBeingEdited()!.id!,
                        data: checklistForm.getRawValue()
                    })
                    : checklistService.add$.next(checklistForm.getRawValue())
          "
        />
      </ng-template>
    </app-modal>
  `,
  imports: [
    ModalComponent,
    FormModalComponent,
    ChecklistListComponent
  ],
  styles: [
    `
      ul {
        padding: 0;
        margin: 0;
      }

      li {
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        background: var(--color-light);
        list-style-type: none;
        margin-bottom: 1rem;
        padding: 1rem;

        button {
          margin-left: 1rem;
        }
      }
    `,
  ]
})
// Responsibility: Smart component in charge of all checklists
export default class HomeComponent {
  // --- Dependencies
  public formBuilder: FormBuilder = inject(FormBuilder);
  public checklistService: ChecklistService = inject(ChecklistService);

  // Track the checklist that is currently being edited
  public checklistBeingEdited = signal<Partial<Checklist> | null>(null)

  // Form for creating/editing checklists
  public checklistForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    // Reset `checklistForm` when `checklistBeingEdited()` is null
    effect((): void => {
      const checklist: Partial<Checklist> | null = this.checklistBeingEdited();
      if (!checklist) this.checklistForm.reset(); // Imperative code
      else {
        this.checklistForm.patchValue({
          title: checklist.title
        });
      }
    });
  }
}

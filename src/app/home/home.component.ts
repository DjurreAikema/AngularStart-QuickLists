import {Component, effect, inject, signal} from "@angular/core";
import {ModalComponent} from "../shared/ui/modal.component";
import {Checklist} from "../shared/interfaces/checklist";
import {FormBuilder} from "@angular/forms";
import {FormModalComponent} from "../shared/ui/form-modal.component";

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>

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
        />
      </ng-template>
    </app-modal>
  `,
  imports: [
    ModalComponent,
    FormModalComponent
  ]
})
// Responsibility:
export default class HomeComponent {
  // --- Dependencies
  public formBuilder: FormBuilder = inject(FormBuilder);

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
    });
  }
}

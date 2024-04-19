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
      <app-checklist-list [checklists]="checklistService.checklists()"/>
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
          (save)="checklistService.add$.next(checklistForm.getRawValue())"
        />
      </ng-template>
    </app-modal>
  `,
  imports: [
    ModalComponent,
    FormModalComponent,
    ChecklistListComponent
  ]
})
// Responsibility:
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
    });
  }
}

import {Component, computed, effect, inject, signal} from '@angular/core';
import {ChecklistService} from "../shared/data-access/checklist.service";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {ChecklistHeaderComponent} from "./ui/checklist-header.component";
import {ChecklistItemService} from "./data-access/checklist-item.service";
import {FormBuilder} from "@angular/forms";
import {ChecklistItem} from "../shared/interfaces/checklist-item";
import {ModalComponent} from "../shared/ui/modal.component";
import {FormModalComponent} from "../shared/ui/form-modal.component";

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent
  ],
  template: `
    @if (checklist(); as checklist) {
      <app-checklist-header
        [checklist]="checklist"
        (addItem)="checklistItemBeingEdited.set({})"
      />
    }

    <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <app-form-modal
          title="Create item"
          [formGroup]="checklistItemForm"
          (save)="checklistItemService.add$.next({
                item: checklistItemForm.getRawValue(),
                checklistId: checklist()?.id!,
            })"
          (close)="checklistItemBeingEdited.set(null)"
        ></app-form-modal>
      </ng-template>
    </app-modal>
  `,
  styles: ``
})
// Responsibility: Smart component in charge of a checklist and its items
export default class ChecklistComponent {
  // --- Dependencies
  public checklistService: ChecklistService = inject(ChecklistService);
  public checklistItemService: ChecklistItemService = inject(ChecklistItemService);

  private route: ActivatedRoute = inject(ActivatedRoute);
  private formBuilder: FormBuilder = inject(FormBuilder);

  public params = toSignal(this.route.paramMap);

  // Get the selected checklist by the id from the url parameters
  public checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id == this.params()?.get('id'))
  );

  // --- Checklist items
  // Track the checklist item that is currently being edited
  public checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  // Form for creating/editing a checklist item
  checklistItemForm = this.formBuilder.nonNullable.group({
    title: ['']
  });

  constructor() {
    // Reset `checklistItemForm` when `checklistItemBeingEdited` is null
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();
      if (!checklistItem) this.checklistItemForm.reset(); // Imperative code
    });
  }
}

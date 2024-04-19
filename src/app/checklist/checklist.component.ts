import {Component, computed, inject} from '@angular/core';
import {ChecklistService} from "../shared/data-access/checklist.service";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {ChecklistHeaderComponent} from "./ui/checklist-header.component";

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    ChecklistHeaderComponent
  ],
  template: `
    @if (checklist(); as checklist) {
      <app-checklist-header [checklist]="checklist"/>
    }
  `,
  styles: ``
})
export default class ChecklistComponent {
  // --- Dependencies
  public checklistService: ChecklistService = inject(ChecklistService);
  public route: ActivatedRoute = inject(ActivatedRoute);

  public params = toSignal(this.route.paramMap);

  public checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id == this.params()?.get('id'))
  );
}

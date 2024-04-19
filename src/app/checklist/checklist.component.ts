import {Component, computed, inject} from '@angular/core';
import {ChecklistService} from "../shared/data-access/checklist.service";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [],
  template: `
    <p>
      Hi
    </p>
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

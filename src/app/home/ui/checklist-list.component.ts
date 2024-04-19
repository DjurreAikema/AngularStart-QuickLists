import {Component, Input} from '@angular/core';
import {Checklist} from "../../shared/interfaces/checklist";

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [],
  template: `
    <ul>
      @for (checklist of checklists; track checklist.id) {
        <li>{{ checklist.title }}</li>
      } @empty {
        <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  styles: ``
})
// Responsibility: Dumb component that will display a list of checklists
export class ChecklistListComponent {
  @Input({required: true}) checklists!: Checklist[];
}

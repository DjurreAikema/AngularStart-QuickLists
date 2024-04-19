import {Component, Input} from '@angular/core';
import {Checklist} from "../../shared/interfaces/checklist";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  template: `
    <ul>
      @for (checklist of checklists; track checklist.id) {
        <li>
          <a routerLink="/checklist/{{checklist.id}}">
            {{ checklist.title }}
          </a>
        </li>
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

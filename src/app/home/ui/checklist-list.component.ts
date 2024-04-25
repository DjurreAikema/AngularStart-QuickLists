import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Checklist, RemoveChecklist} from "../../shared/interfaces/checklist";
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
          <div>
            <button (click)="edit.emit(checklist)">Edit</button>
            <button (click)="delete.emit(checklist.id)">Delete</button>
          </div>
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

  @Output() edit = new EventEmitter<Checklist>();
  @Output() delete = new EventEmitter<RemoveChecklist>();
}

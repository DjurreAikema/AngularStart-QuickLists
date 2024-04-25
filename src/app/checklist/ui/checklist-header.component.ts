import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RouterLink} from "@angular/router";
import {Checklist, RemoveChecklist} from "../../shared/interfaces/checklist";

@Component({
  selector: 'app-checklist-header',
  standalone: true,
  imports: [
    RouterLink
  ],
  template: `
    <header>
      <a routerLink="/home">Back</a>

      <div class="title">
        <h1>{{ checklist.title }}</h1>
        <h3>{{ completedItemsCount }}/{{ itemsCount }} items completed</h3>
      </div>

      <div>
        <button (click)="resetChecklist.emit(checklist.id)">Reset</button>
        <button (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  styles: [
    `
      .title {
        display: flex;
        flex-flow: column;
        align-items: center;
      }

      button {
        margin-left: 1rem;
      }
    `,
  ]
})
// Responsibility: Dumb component that displays the header on the checklist detail page
export class ChecklistHeaderComponent {
  @Input({required: true}) checklist!: Checklist;
  @Input({required: true}) itemsCount!: number;
  @Input({required: true}) completedItemsCount!: number;

  @Output() addItem = new EventEmitter<void>();
  @Output() resetChecklist = new EventEmitter<RemoveChecklist>();
}

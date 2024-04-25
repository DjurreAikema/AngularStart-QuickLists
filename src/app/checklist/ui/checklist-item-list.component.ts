import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChecklistItem, RemoveChecklistItem} from "../../shared/interfaces/checklist-item";

@Component({
  selector: 'app-checklist-item-list',
  standalone: true,
  imports: [],
  template: `
    <section>
      <ul>
        @for (item of checklistItems; track item.id) {
          <li>
            <div>
              @if (item.checked) {
                <span>✅</span>
              }
              {{ item.title }}
            </div>
            <div>
              <button (click)="toggle.emit(item.id)">Toggle</button>
            </div>
          </li>
        } @empty {
          <div>
            <h2>Add an item</h2>
            <p>Click the add button to add your first item to this quicklist</p>
          </div>
        }
      </ul>
    </section>
  `,
  styles: ``
})
// Responsibility: Dumb component that displays a list of checklist items on the checklist detail page
export class ChecklistItemListComponent {
  @Input({required: true}) checklistItems!: ChecklistItem[];

  @Output() toggle = new EventEmitter<RemoveChecklistItem>();
}

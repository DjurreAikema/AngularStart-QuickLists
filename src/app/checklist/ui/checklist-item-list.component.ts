import {Component, Input} from '@angular/core';
import {ChecklistItem} from "../../shared/interfaces/checklist-item";

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
              {{ item.title }}
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
}

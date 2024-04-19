import {Component} from "@angular/core";
import {ModalComponent} from "../shared/ui/modal.component";

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <header>
      <h1>Quicklists</h1>
      <button>Add Checklist</button>
    </header>

    <app-modal>
      <ng-template> You can't see me... yet</ng-template>
    </app-modal>
  `,
  imports: [
    ModalComponent
  ]
})
// Responsibility:
export default class HomeComponent {
}

import {Component} from "@angular/core";

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <header>
      <h1>Quicklists</h1>
      <button>Add Checklist</button>
    </header>
  `,
})
export default class HomeComponent {
}

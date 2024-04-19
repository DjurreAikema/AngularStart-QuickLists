import {Component, EventEmitter, Input, Output} from "@angular/core";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {KeyValuePipe} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-form-modal',
  template: `
    <header>
      <h2>{{ title }}</h2>
      <button (click)="close.emit()">Close</button>
    </header>

    <section>
      <form [formGroup]="formGroup" (ngSubmit)="save.emit(); close.emit()">
        @for (control of formGroup.controls | keyvalue; track control.key) {
          <div>
            <label [for]="control.key">{{ control.key }}</label>
            <input
              [id]="control.key"
              type="text"
              [formControlName]="control.key"
            />
          </div>
        }
        <button type="submit">Save</button>
      </form>
    </section>
  `,
  imports: [ReactiveFormsModule, KeyValuePipe]
})
// Responsibility: Dumb component that TODO
export class FormModalComponent {
  @Input({required: true}) formGroup!: FormGroup;
  @Input({required: true}) title!: string;

  @Output() save: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}

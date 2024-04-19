import {Component, ContentChild, inject, Input, TemplateRef} from "@angular/core";
import {Dialog} from "@angular/cdk/dialog";

@Component({
  standalone: true,
  selector: 'app-modal',
  template: `
    <div></div>`,
})
// Responsibility: Dumb component that will allow us to show our modal more easily.
export class ModalComponent {
  // !!Convention break: <Exception>
  // By using `Dialog` this component isn't really gaining any knowledge of the application more broadly.
  public dialog: Dialog = inject(Dialog);

  // Get a reference to a `TemplateRef` that is supplies inside the `<app-modal>` selector.
  @ContentChild(TemplateRef, {static: false}) template!: TemplateRef<any>;

  // Open and close the dialog based on a `Signal` input
  @Input() set isOpen(value: boolean) {
    if (value)
      this.dialog.open(this.template, {panelClass: 'dialog-container'});
    else
      this.dialog.closeAll();
  }
}

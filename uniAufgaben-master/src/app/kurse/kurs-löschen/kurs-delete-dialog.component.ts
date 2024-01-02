import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {KursService} from "../kurs.service";
import {AufgabenService} from "../../aufgaben/aufgaben.service";

@Component({
    selector: 'kurs-delete-dialog',
    templateUrl: './kurs-delete-dialog.component.html',
    styleUrls: ['kurs-delete-dialog.component.scss']
})
export class KursDeleteDialogComponent {

  deleting = false; // Ladebalken, während Löschung durchgeführt wird.

  constructor(@Inject(MAT_DIALOG_DATA)
              public data:{id:String, name:String},
              public kursService:KursService,
              public aufgabenService:AufgabenService,
              private dialogRef:MatDialogRef<KursDeleteDialogComponent>) {}

  // Funktion, welche die Löschung durchführt, wenn der Nutzer bestätigt hat.
  onDelete() {
    this.deleting = true;

    // Löscht sämtliche Aufgaben in einem Kurs und löscht anschliessend den Kurs selbst.
    // Schliesst anschliessend das Dialogfenster und bestätigt die Löschung.
    this.aufgabenService.fullDeleteKurs(this.data.id).subscribe(() => {
      this.kursService.deleteKurs(this.data.id)
        .subscribe(() => {
          this.dialogRef.close({deleted: true});
        });
    })
  }

  // Funktion welche das Dialogfenster schliesst, wenn der Nutzer die Löschung abbricht.
  onCancel(){
    this.deleting = false;
    this.dialogRef.close({deleted: false})
  }
}

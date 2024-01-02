import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AufgabenService} from "../aufgaben.service";
import {concatMap} from "rxjs";
import {KursService} from "../../kurse/kurs.service";

@Component({
  selector: 'aufgabe-delete-dialog',
  templateUrl: 'aufgabe-delete-dialog.component.html',
  styleUrls: ['aufgabe-delete-dialog.component.scss']
})

export class AufgabeDeleteDialogComponent {

  deleting = false; // Boolean für Ladebalken während der Löschung.

  constructor(@Inject(MAT_DIALOG_DATA) public data:{id:string, kurs:string},
              public aufgabenService:AufgabenService,
              private kursService:KursService,
              private dialogRef:MatDialogRef<AufgabeDeleteDialogComponent>) {}

  // Funktion, welche gerufen wird, wenn der Nutzer die Löschung bestätigt.
  onDelete(){
    this.deleting = true;

    // Löscht die Aufgabe.
    this.aufgabenService.deleteAufgabe(this.data.id)
      .pipe(
        concatMap(() => {
          // Aktualisiert die Bewertung des betroffenen Kurses.
          return this.kursService.updateBewertung(this.data.kurs);
        })
      )
      .subscribe(() => {
        // Schliesst das Dialogfeld und bestätigt die erfolgte Löschung.
        this.dialogRef.close({deleted: true});
      }
    )
  }

  // Funktion, welche gerufen wird, wenn der Nutzer die Löschung abbricht.
  onCancel(){
    // Schliesst das Dialogfeld.
    this.dialogRef.close({deleted: false});
  }
}

import {Component} from "@angular/core";
import {KursService} from "../../../kurse/kurs.service";
import {AufgabenService} from "../../../aufgaben/aufgaben.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {catchError, forkJoin, throwError} from "rxjs";
import {ErrorComponent} from "../../../error/error.component";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'account-delete-dialog',
  templateUrl: 'account-delete-dialog.component.html',
  styleUrls: ['account-delete-dialog.component.scss']
})

export class AccountDeleteDialogComponent{

  deleteForm!:FormGroup; // Passwortfeld. Definiert im Constructor.

  constructor(private kursService:KursService,
              private aufgabenService:AufgabenService,
              private authService:AuthService,
              private router:Router,
              private dialog:MatDialog,
              private snackBar:MatSnackBar,
              private dialogRef:MatDialogRef<AccountDeleteDialogComponent>) {
    this.deleteForm = new FormGroup({
      passFC: new FormControl('',[Validators.required])
    });
  }

  deleting = false; // Ladebalken, wenn gelöscht wird.
  accepted = false; // Zeigt im Dialogfeld an, dass das Konto gelöscht wird.

  // Schliesst das Dialogfeld, wenn der Nutzer sein Konto nicht löschen möchte.
  onCancel(){
    this.dialogRef.close();
  }

  // Löscht das Konto, wenn der Nutzer bestätigt.
  onDelete(){
    this.deleteForm.get('passFC')?.disable();
    this.deleting = true;

    // Überprüft das Passwort auf Korrektheit.
    this.authService.pwCheck(this.deleteForm.get('passFC')?.value)
      .pipe(
        catchError((err) => {
          this.deleteForm.reset('passFC');

          this.dialog.open(ErrorComponent, {
            data: {message: 'Konto konnte nicht geschlossen werden.'},
            disableClose: true
          });

          this.deleting = false;
          this.deleteForm.get('passFC')?.enable();

          return throwError(() => err)
        })
      )
      .subscribe(() => {
        this.accepted = true;

      // Löscht alle Aufgaben, alle Kurse und schliesslich das Konto.
      forkJoin([this.aufgabenService.fullDeleteAll(), this.kursService.fullDeleteAll(), this.authService.delete()])
        .subscribe(() => {
          this.router.navigate(['/login']);
          this.authService.logout();
          this.snackBar.open("Kontoschliessung erfolgreich.", "OK",{
            duration: 10000,
            horizontalPosition: "center",
            verticalPosition: "top"
          });
          this.dialogRef.close();
        });
      });
  }
}

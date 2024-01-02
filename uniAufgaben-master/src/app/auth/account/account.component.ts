import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {MatDialog} from "@angular/material/dialog";
import {AccountDeleteDialogComponent} from "./account-löschen/account-delete-dialog.component";
import {catchError, throwError} from "rxjs";
import {ErrorComponent} from "../../error/error.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'account',
  templateUrl: 'account.component.html',
  styleUrls: ['account.component.scss']
})

export class AccountComponent implements OnInit{

  accountForm!:FormGroup // Formular. Definiert im Constructor.

  constructor(private authService:AuthService,
              private dialog:MatDialog,
              private snackBar:MatSnackBar) {
    this.accountForm = new FormGroup({
      oldPassFC: new FormControl('', [Validators.required]),
      passFC: new FormControl(null,[Validators.required, Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$@€£!?+.,#\\-]).{8,}')]),
      passConfFC: new FormControl('', [Validators.required,this.passwordMatchValidator()])
    });
  }

  nutzername?:string;

  loading = false; // Boolean für den Ladebalken.

  // Validator; stellt sicher, dass die eingegebene Passwörter in "Neues Passwort" und "Neues Passwort wiederholen"
  // identisch sind.
  passwordMatchValidator():ValidatorFn {
    return ():ValidationErrors | null => {

      let passFC, passConfFC;
      try {
        passFC = this.accountForm.get('passFC')?.value;
        passConfFC = this.accountForm.get('passConfFC')?.value;
      } catch (e) {
        return null;
      }

      if(!passFC || !passConfFC) return null;

      if(passFC != passConfFC){
        return {passNotMatching: true};
      } else {
        return null;
      }
    }
  }

  // Funktion, welche aufgerufen wird beim Erscheinen der Komponente.
  ngOnInit() {
    this.nutzername = this.authService.getNutzername();
  }

  // Erhalte Feld mit altem Passwort.
  getOldPW(){
    return this.accountForm.get('oldPassFC');
  }

  // Erhalte Feld mit neuem Passwort.
  getPW(){
    return this.accountForm.get('passFC');
  }

  // Erhalte Feld mit Bestätigung des neuen Passworts.
  getPWConf(){
    return this.accountForm.get('passConfFC');
  }

  // Funktion, welche gerufen wird, wenn der Nutzer das neue Passwort speichert.
  onSave() {
    this.loading = true;

    // Überprüft eingegebenes Passwort auf Korrektheit.
    this.authService.pwCheck(this.getOldPW()?.value)
      .pipe(
        catchError((err) => {

          let errorMessage;
          if(err.error.message){
            errorMessage = err.error.message;
          } else {
            errorMessage = "Ein unbekannter Fehler ist aufgetreten."
          }
          this.dialog.open(ErrorComponent, {
            data: {message: errorMessage},
            disableClose: true
          });
          this.loading = false;
          return throwError(() => err)
        })
      )
      .subscribe(() => {
        // Ändert Passwort.
        this.authService.changePassword(this.accountForm.value.passFC)
          .subscribe(() => {
            this.snackBar.open("Neues Passwort gespeichert.", "OK",{
              duration: 5000,
              horizontalPosition: "center",
              verticalPosition: "top"
            });
            this.accountForm.reset();
            this.loading = false;
          });
      })
  }

  // Funktion, welche ein Dialogfeld zur Bestätigung öffnet, falls der Nutzer sein Konto schliessen möchte.
  onDelete() {
    this.dialog.open(AccountDeleteDialogComponent, {disableClose:true});
  }
}

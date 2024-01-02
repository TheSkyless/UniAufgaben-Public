import {Component} from "@angular/core";
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {catchError, throwError} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'signup',
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})

export class SignupComponent {

  signupForm!:FormGroup; // Registrierungsformular. Definiert im Constructor.

  constructor(public authService:AuthService,
              private router:Router,
              private route:ActivatedRoute,
              private snackBar:MatSnackBar) {
    this.signupForm = new FormGroup({
      nameFC: new FormControl('', [Validators.required, Validators.pattern('.*[0-9a-zA-Z._\\-]')]),
      passFC: new FormControl('', [Validators.required, Validators.pattern('(?!.* )(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$@€£!?+.,#\\-]).{8,}')]),
      passConfFC: new FormControl('', [Validators.required,this.passwordMatchValidator()])
    });
  }

  loading = false; // Boolean für Ladebalken.

  // Validator; stellt sicher, dass die Passwörter in "Passwort" und "Passwort bestätigen" identisch sind.
  passwordMatchValidator():ValidatorFn {
    return ():ValidationErrors | null => {

      let passFC, passConfFC;
      try {
        passFC = this.signupForm.get('passFC')?.value;
        passConfFC = this.signupForm.get('passConfFC')?.value;
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

  // Gibt das Feld mit dem Nutzernamen zurück.
  getName(){
    return this.signupForm.get('nameFC');
  }

  // Gibt das Feld mit dem Passwort zurück.
  getPW(){
    return this.signupForm.get('passFC');
  }

  // Gibt das Feld mit der Passwortbestätigung zurück.
  getPWConf(){
    return this.signupForm.get('passConfFC');
  }

  // Registriert den Nutzer.
  onSignup(){
    // Bricht ab, falls das Formular ungültig ist.
    if(this.signupForm.invalid) return;

    this.signupForm.get('nameFC')?.disable();
    this.signupForm.get('passFC')?.disable();
    this.signupForm.get('passConfFC')?.disable();

    this.loading = true;

    const nutzername = this.signupForm.value.nameFC.toLowerCase();
    const passwort = this.signupForm.value.passFC;

    // Führt die Registrierung durch.
    this.authService.signup(nutzername, passwort)
      .pipe(
        catchError((err) => {
          try {
            if(err.error.error._message === "nutzer validation failed"){
              this.snackBar.open("Nutzername existiert bereits.", "OK",{
                duration: 5000,
                horizontalPosition: "center",
                verticalPosition: "top"
              });

              this.signupForm.reset();
              this.signupForm.get('nameFC')?.enable();
              this.signupForm.get('passFC')?.enable();
              this.signupForm.get('passConfFC')?.enable();
              this.loading = false;
            }
          } catch (e) {}
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.router.navigate(['../login'],{relativeTo: this.route});
      });
  }
}

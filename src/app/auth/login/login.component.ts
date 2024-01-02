import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})

export class LoginComponent{

  loginForm!:FormGroup; // Anmeldefelder. Definiert im Constructor.

  constructor(public authService:AuthService, private router:Router, private snackBar:MatSnackBar) {
    this.loginForm = new FormGroup({
      nameFC: new FormControl(null,[Validators.required]),
      passFC: new FormControl(null,[Validators.required])
    });
  }

  loading = false; // Boolean für Ladebalken.

  // Meldet einen Nutzer an.
  onLogin() {
    // Bricht ab, falls Formular ungültig ist.
    if (this.loginForm.invalid) return;

    this.loginForm.get('nameFC')?.disable();
    this.loginForm.get('passFC')?.disable();

    this.loading = true;

    const nutzername = this.loginForm.value.nameFC.toLowerCase();
    const passwort = this.loginForm.value.passFC;

    // Führt die Anmeldung durch.
    this.authService.login(nutzername, passwort)
     .subscribe(
     result => {
       if(result == true){
         this.router.navigate(['/']);
         this.snackBar.open("Anmeldung erfolgreich.", "OK",{
           duration: 5000,
           horizontalPosition: "center",
           verticalPosition: "top"
         });
       } else {
         this.snackBar.open("Anmeldung fehlgeschlagen.", "OK",{
           duration: 5000,
           horizontalPosition: "center",
           verticalPosition: "top"
         });
         this.loginForm.get('passFC')?.reset();

         this.loginForm.get('nameFC')?.enable();
         this.loginForm.get('passFC')?.enable();
         this.loading = false;
       }
     }
    )
  }
}

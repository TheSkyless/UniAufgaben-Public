import {Component, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy{

  constructor(private authService:AuthService) {}

  private authSub!:Subscription;
  public isAuthenticated = false; // Boolean, welches bestimmt, ob ein Nutzer authentifiziert ist, oder nicht.

  // Funktion, welche aufgerufen wird beim Erscheinen der Komponente.
  ngOnInit() {
    // Ruft Service ab, um den Authentifizierungsstatus zu erhalten.
    this.isAuthenticated = this.authService.getIsAuthenticated();

    // Aktualisiert isAuthenticated mit dem entsprechenden Wert.
    this.authSub = this.authService.getUpdateListener()
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });
  }

  // Funktion, welche gerufen wird, sobald die Komponente nicht mehr gebraucht wird.
  ngOnDestroy() {
    // Beendet Abonnement zum authStatusListener.
    this.authSub.unsubscribe();
  }

  // Funktion, welche den Nutzer abmeldet, wenn auf "Abmelden" geklickt wird.
  onLogout(){
    this.authService.logout();
  }

}

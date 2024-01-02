import {AuthService} from "./auth.service";
import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";

// Funktion zum Überprüfen, ob der Nutzer authentifiziert ist.
export const AuthGuard:CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isAuth = authService.getIsAuthenticated();

  // Gehe zur Anmeldung, wenn nicht angemeldet.
  if(!isAuth){router.navigate(['/login']);}

  return isAuth;
};

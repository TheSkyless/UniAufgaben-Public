import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthData} from "./auth-data.model";
import {catchError, Subject, throwError} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ErrorComponent} from "../error/error.component";
import {environment} from "../../environments/environment.development";

@Injectable({providedIn: 'root'})
export class AuthService {
  private authenticated = false; // Nutzer ist angemeldet.
  private nutzerID?:string; // ID des Nutzers.
  private nutzername!:string;
  private token?:string; // Authentifizierungstoken.
  private tokenTimer?:any; // Zähler für den Token.

  private baseURL = 'http://'+environment.apiDomain+'/api/v1/'; // Basis-URL der API. Domain definiert in den ./environments Dateien.

  private authStatusListener = new Subject<boolean>();

  constructor(private httpClient:HttpClient,
              private router:Router,
              private dialog:MatDialog) {}

  // Abonnierbares, observierbares Objekt, um Änderungen zu verarbeiten.
  getUpdateListener(){
    return this.authStatusListener.asObservable();
  }

  //----- HTTP POST FUNKTIONEN -----

  // Meldet einen Nutzer an.
  login(nutzername:string, passwort:string){
    const authData:AuthData = {nutzername: nutzername, passwort: passwort};
    let authSuccess = new Subject<boolean>();

    this.httpClient.post<{token:string,expiresIn:number,nutzerID:string}>(this.baseURL+'nutzer/login',authData)
      .pipe(
        catchError((err) => {
          authSuccess.next(false);
          return throwError(() => err);
        })
      )
      .subscribe(response => {
        const token = response.token;
        if(token){
          const expiry = response.expiresIn;
          this.setAuthTimer(expiry);

          this.token = token;
          this.nutzerID = response.nutzerID;
          this.nutzername = nutzername;
          this.authenticated = true;
          this.authStatusListener.next(true);

          const now = new Date();
          const expiryDate = new Date(now.getTime() + expiry*1000);
          this.saveAuthData(token,expiryDate,this.nutzerID,this.nutzername);
          authSuccess.next(true);
        } else authSuccess.next(false);
      });
    return authSuccess;
  }

  // Überprüft ein eingegebenes Passwort mit dem in der Datenbank gespeicherten Passwort.
  pwCheck(passwort:string){
    const authData:AuthData = {nutzername: this.nutzername, passwort: passwort};
    return this.httpClient.post<{token:string,expiresIn:number,nutzerID:string}>(this.baseURL+'nutzer/login',authData);
  }

  // Registriert einen neuen Nutzer.
  signup(nutzername:string, passwort:string){
    const authData:AuthData = {nutzername: nutzername, passwort: passwort};
    return this.httpClient.post(this.baseURL+'nutzer/signup', authData);
  }

  //----- HTTP PATCH FUNKTIONEN -----

  // Ändert das Passwort des Nutzers.
  changePassword(passwort:string) {
    return this.httpClient.patch(this.baseURL+'nutzer/'+this.nutzerID,{passwort:passwort})
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
          return throwError(() => err)
        })
      );
  }

  //----- HTTP DELETE FUNKTIONEN -----

  // Löscht einen Nutzer.
  delete(){
    return this.httpClient.delete(this.baseURL+'nutzer')
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
          return throwError(() => err)
        })
      );
  }

  //----- Weitere Funktionen -----

  // Meldet einen Nutzer automatisch an.
  autoAuth(){
    const authData = this.getAuthData();

    if(!authData) return;

    const now = new Date();
    const expiresInDuration = authData.expiryDate.getTime() - now.getTime();

    if(expiresInDuration > 0) {
      this.token = authData.token;
      this.nutzerID = authData.nutzerID;
      this.nutzername = authData.nutzername;
      this.authenticated = true;

      this.setAuthTimer(expiresInDuration/1000);

      this.authStatusListener.next(true);
    }
  }

  // Ladet Auth-Daten aus dem LocalStorage vom Endgerät.
  private getAuthData(){
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiry');
    const nutzerID = localStorage.getItem('nutzerID');
    const nutzername = localStorage.getItem('nutzername');

    if(!token || !expiryDate || !nutzerID || !nutzername) return;

    return {
      token: token,
      expiryDate: new Date(expiryDate),
      nutzerID: nutzerID,
      nutzername: nutzername
    };
  }

  // Gibt an, ob der Nutzer angemeldet ist oder nicht.
  getIsAuthenticated(){
    return this.authenticated;
  }

  // Gibt den AuthToken zurück.
  getToken(){
    return this.token;
  }

  // Gibt die Nutzer ID zurück.
  getNutzerID(){
    return this.nutzerID;
  }

  // Gibt den Nutzernamen zurück.
  getNutzername(){
    return this.nutzername;
  }

  // Speichert Auth-Daten in den LocalStorage des Endgeräts ab.
  private saveAuthData(token:string, expiryDate:Date, nutzerID:string, nutzername:string){
    localStorage.setItem('token',token);
    localStorage.setItem('expiry',expiryDate.toISOString());
    localStorage.setItem('nutzerID',nutzerID);
    localStorage.setItem('nutzername',nutzername);
  }

  // Setzt einen Timer, bei wessen Ende dann der Nutzer automatisch abgemeldet wird.
  private setAuthTimer(duration:number){
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration*1000);
  }

  // Löscht Auth-Daten aus dem LocalStorage des Endgeräts.
  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    localStorage.removeItem('nutzerID');
    localStorage.removeItem('nutzername');
  }

  // Meldet den Nutzer ab.
  logout(){
    delete this.token;
    delete this.nutzerID;
    this.authenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/login']);

    this.clearAuthData();
    clearTimeout(this.tokenTimer);
  }

}

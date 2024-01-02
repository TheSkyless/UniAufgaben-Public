import {Injectable} from "@angular/core";
import {Aufgabe} from "./aufgaben.model";
import {catchError, Subject, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {ErrorComponent} from "../error/error.component";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment.development";

@Injectable({providedIn: 'root'})
export class AufgabenService {
  private aufgaben:Aufgabe[] = []; // Liste an Aufgaben.
  private aufgabenSubject = new Subject<{aufgaben:Aufgabe[]}>(); // Observierbarer Type, welcher abonniert werden kann, um Aufgaben abzurufen.

  private baseURL = 'http://'+environment.apiDomain+'/api/v1/'; // Basis-URL der API. Domain definiert in den ./environments Dateien.

  constructor(private httpClient:HttpClient,
              private dialog:MatDialog,
              private router:Router) {}

  // Abonnierbares, observierbares Objekt, um Änderungen zu verarbeiten.
  getUpdateListener(){
    return this.aufgabenSubject.asObservable();
  }

  //----- HTTP GET FUNKTIONEN -----

  // Alle Aufgaben aus der Datenbank abrufen.
  getAufgaben(id?:String|undefined){
    let suffix = 'aufgaben/'

    // Überprüfe, ob eine KursID angegeben wurde und füge diese als Query Parameter an, falls vorhanden.
    if(id){
      suffix += "?kursID="+id;
    }

    // Ruft alle Aufgaben eines Nutzers ab, ggf. von einem spezifischen Kurs.
    return this.httpClient.get<{message: String, aufgaben: any}>(this.baseURL+suffix)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      )
      .pipe(
        map(function (aufgabenData) {
          // Umgestaltung der Daten, damit '_id' zu 'id' umbenannt werden kann.
          return {
            aufgaben: aufgabenData.aufgaben.map((aufgabe:{
              seriennummer:any,
              faelligkeitsdatum:any,
              status:any,
              kommentar:any,
              nutzer:any,
              kurs:any,
              _id:any
            }) => {
              return {
                seriennummer: aufgabe.seriennummer,
                faelligkeit: aufgabe.faelligkeitsdatum,
                status: aufgabe.status,
                kommentar: aufgabe.kommentar,
                nutzer: aufgabe.nutzer,
                kurs: aufgabe.kurs,
                id: aufgabe._id
              }
            })
          }
        }))
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      )
      .subscribe((transformedAufgabe) => {
        this.aufgaben = transformedAufgabe.aufgaben;
        this.aufgabenSubject.next({aufgaben: [...this.aufgaben]});
      });
  };

  // Ruft eine Aufgabe ab.
  getAufgabe(id:String){
    return this.httpClient.get<{
      seriennummer:any,
      faelligkeitsdatum:any,
      status:any,
      kommentar:any,
      nutzer:any,
      kurs:any,
      _id:any
    }>(this.baseURL+'aufgaben/'+id)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }

  // Ruft die 5 dringendsten Aufgaben eines Nutzers ab.
  dashboard5(){
    return this.httpClient.get<{message: String, aufgaben: any}>(this.baseURL+'aufgaben/?dashboard=true')
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      )
      .pipe(
        map(function (aufgabenData) {
          return {
            aufgaben: aufgabenData.aufgaben.map((aufgabe:{
              seriennummer:any,
              faelligkeitsdatum:any,
              status:any,
              kommentar:any,
              nutzer:any,
              kurs:any,
              _id:any
            }) => {
              return {
                seriennummer: aufgabe.seriennummer,
                faelligkeit: aufgabe.faelligkeitsdatum,
                status: aufgabe.status,
                kommentar: aufgabe.kommentar,
                nutzer: aufgabe.nutzer,
                kurs: aufgabe.kurs,
                id: aufgabe._id
              }
            })
          }
        }))
      .subscribe((transformedAufgabe) => {
        this.aufgaben = transformedAufgabe.aufgaben;
        this.aufgabenSubject.next({aufgaben: [...this.aufgaben]});
      });
  }

  // Ruft die Anzahl offener Aufgaben ab (insg. und nächste 14 Tage)
  getStats(){
    return this.httpClient.get<{message:string, count:number, count14:number}>(this.baseURL+'aufgaben/stats')
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

  //----- HTTP POST FUNKTIONEN -----

  // Erstellt eine Aufgabe.
  addAufgabe(aufgabe:Aufgabe){
    return this.httpClient.post(this.baseURL+'aufgaben/',aufgabe)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }

  //----- HTTP PATCH FUNKTIONEN -----

  // Bearbeitet eine Aufgabe.
  editAufgabe(aufgabe:Aufgabe){
    return this.httpClient.patch(this.baseURL+'aufgaben/'+aufgabe.id,aufgabe)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }

  //----- HTTP DELETE FUNKTIONEN -----

  // Löscht eine Aufgabe.
  deleteAufgabe(id:String){
    return this.httpClient.delete(this.baseURL+'aufgaben/'+id)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }

  // Löscht alle Aufgaben in einem Kurs.
  fullDeleteKurs(id:String){
    return this.httpClient.delete(this.baseURL+'aufgaben/?kursID='+id)
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }

  // Löscht alle Aufgaben eines Nutzers.
  fullDeleteAll(){
    return this.httpClient.delete(this.baseURL+'aufgaben')
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
          this.router.navigate(['/']);
          return throwError(() => err)
        })
      );
  }
}

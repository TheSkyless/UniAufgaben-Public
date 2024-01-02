import {Injectable} from "@angular/core";
import {Kurs} from "./kurs.model";
import {catchError, Subject, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {map} from 'rxjs/operators';
import {ErrorComponent} from "../error/error.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment.development";

@Injectable({providedIn: 'root'})
export class KursService{
  private kurse:Kurs[] = []; // Liste an Kurse.
  private kursSubject = new Subject<{kurse:Kurs[]}>(); // Observierbarer Type, welcher abonniert werden kann, um Kurse abzurufen.

  private baseURL = 'http://'+environment.apiDomain+'/api/v1/'; // Basis-URL der API. Domain definiert in den ./environments Dateien.

  constructor(private httpClient:HttpClient,
              private router:Router,
              private dialog:MatDialog,
              private snackBar:MatSnackBar) {}

  // Abonnierbares, observierbares Objekt, um Änderungen zu verarbeiten.
  getUpdateListener(){
    return this.kursSubject.asObservable();
  }

  //----- HTTP GET FUNKTIONEN -----

  // Ruft alle Kurse ab und bereitet diese vor. Übergibt vorbereitete Kurse dann kursSubject.
  getKurse(){
    return this.httpClient.get<{message: String, kurse: any}>(this.baseURL+'kurse/')
      .pipe(
        map(function (kursData) {
          // Umgestaltung der Daten, damit '_id' zu 'id' umbenannt werden kann.
          return {
            kurse: kursData.kurse.map(function (kurs: {
              name: any;
              semester: any;
              fach: any;
              bewertet: any;
              serien_insgesamt: any;
              serien_benoetigt: any;
              serien_bestanden: any;
              serien_nicht_bestanden: any;
              nutzer: any;
              _id: any
            }) {
              return {
                name: kurs['name'],
                semester: kurs.semester,
                fach: kurs.fach,
                bewertet: kurs.bewertet,
                serien_insgesamt: kurs.serien_insgesamt,
                serien_benoetigt: kurs.serien_benoetigt,
                serien_bestanden: kurs.serien_bestanden,
                serien_nicht_bestanden: kurs.serien_nicht_bestanden,
                nutzer: kurs.nutzer,
                id: kurs._id
              }
            })
          }
        })
      )
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
      .subscribe((transformedKurs) => {
        this.kurse = transformedKurs.kurse;
        this.kursSubject.next({
          kurse: [...this.kurse]
        })
      });
  }

  // Ruft einen Kurs ab.
  getKurs(id:String){
    return this.httpClient.get<{_id:any, name:any, fach:any, semester:any, bewertet:any, serien_insgesamt:any, serien_benoetigt:any, serien_bestanden:any, nutzer:any}>(this.baseURL+'kurse/'+id)
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

  // Ruft den Namen eines Kurses ab.
  getKursName(id:String){
    return this.httpClient.get<{name:any}>(this.baseURL+'kurse/'+id)
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

  //----- HTTP POST FUNKTIONEN -----

  // Fügt der Datenbank einen neuen Kurs hinzu.
  addKurs(kurs:Kurs){
    this.httpClient.post(this.baseURL+'kurse/',kurs)
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
      .subscribe(() => {
        this.router.navigate(['/kurse']);
        this.snackBar.open("Kurs erstellt.", "OK",{
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
      })
  }

  //----- HTTP PATCH FUNKTIONEN -----

  // Verändert einen Kurs.
  editKurs(kurs:Kurs){
    this.httpClient.patch(this.baseURL+'kurse/'+kurs.id,kurs)
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
      .subscribe(() => {
        this.router.navigate(['/kurse']);
        this.snackBar.open("Kurs gespeichert.", "OK",{
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
      });
  }

  // Aktualisiere die Bewertung eines Kurses.
  updateBewertung(id:String){
    return this.httpClient.patch(this.baseURL+'kurse/'+id+"?checkBewertung=true",null)
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

  // Löscht einen Kurs.
  deleteKurs(id:String){
    return this.httpClient.delete(this.baseURL+'kurse/'+id)
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

  // Löscht alle Kurse eines Nutzers.
  fullDeleteAll(){
    return this.httpClient.delete(this.baseURL+'kurse')
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
}

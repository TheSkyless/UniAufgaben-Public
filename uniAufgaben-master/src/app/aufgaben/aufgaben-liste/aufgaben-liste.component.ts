import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AufgabenService} from "../aufgaben.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {KursService} from "../../kurse/kurs.service";
import {MatDialog} from "@angular/material/dialog";
import {AufgabeDeleteDialogComponent} from "../aufgabe-löschen/aufgabe-delete-dialog.component";
import {FormControl, FormGroup} from "@angular/forms";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'aufgaben-liste',
    templateUrl: 'aufgaben-liste.component.html',
    styleUrls: ['aufgaben-liste.component.scss']
})

export class AufgabenListeComponent implements OnInit, OnDestroy{

  filterForm!:FormGroup; // Eingabefelder für Filter. Definiert im Constructor.

  constructor(public aufgabenService:AufgabenService,
              public kursService:KursService,
              public route:ActivatedRoute,
              public dialog:MatDialog,
              private snackBar:MatSnackBar) {
    this.filterForm = new FormGroup({
      sucheFC: new FormControl(null, []),
      serieFC: new FormControl(null, []),
      statusFC: new FormControl(null,[]),
      startFC: new FormControl(null, []),
      endFC: new FormControl(null, [])
    })
  }

  aufgaben:string[] = []; // Liste an Aufgaben.
  private aufgabenSub!:Subscription;

  kursID?:any; // KursID, falls vorhanden.
  kursName?:String; // Name des Kurses, falls vorhanden.
  kursDict:{[name:string]:string} = {}; // Wörterbuch, welches Kursnamen und KursIDs verbindet.
  private kursSub!:Subscription;

  aufgabenDataSource = new MatTableDataSource(); // Datensatz der Tabelle.
  spalten!:String[]; // Spalten der Tabelle.
  @ViewChild(MatPaginator) paginator!:MatPaginator; // Unterteilt Tabelle in Seiten.
  @ViewChild(MatSort, {static: false}) sort!: MatSort; // Definiert Sortierung der Tabelle.

  loading = true; // Boolean für Ladebalken.

  // Funktion, welche aufgerufen wird beim Erscheinen der Komponente.
  ngOnInit() {
    this.loading = true;

    // Ruft Parameter der URL ab.
    this.route.paramMap.subscribe((paramMap) => {

      // Falls KursID angegeben wurde, Kursname abrufen und Spalte "Kurs" in Tabelle ignorieren.
      // Ansonsten Kurs Spalte anzeigen.
      if (paramMap.has('id')) {
        this.kursID = paramMap.get('id');
        this.kursService.getKursName(this.kursID)
          .subscribe((kursData) => {
            this.kursName = kursData.name;
          });
        this.spalten = ['seriennummer','faelligkeit','status','kommentar','optionen'];
      } else {
        this.spalten = ['kurs','seriennummer','faelligkeit','status','kommentar','optionen'];
      }
      this.kursService.getKurse();
    })

    // Definiert Verhalten beim Abrufen von Kursen.
    this.kursSub = this.kursService.getUpdateListener()
      .subscribe((kursData) => {
        const kurse = kursData.kurse;

        // Erstellt Wörterbuch für Namen und IDs der Kurse.
        for (const i in kurse) {
          const kurs = kurse[i];
          this.kursDict[kurs.id] = kurs.name;
        }

        // Falls KursID vorhanden, nur Aufgaben des angegebenen Kurses abrufen,
        // ansonsten alle Aufgaben des Nutzers abrufen.
        if(this.kursID){
          this.aufgabenService.getAufgaben(this.kursID);
        } else {
          this.aufgabenService.getAufgaben();
        }
      })

    // Definiert Verhalten beim Abrufen von Aufgaben.
    this.aufgabenSub = this.aufgabenService.getUpdateListener()
      .subscribe((aufgabenData) => {
          this.aufgabenDataSource.data = aufgabenData.aufgaben;
          this.aufgabenDataSource.sort = this.sort;
          this.aufgabenDataSource.paginator = this.paginator;
          this.aufgabenDataSource.filterPredicate = this.filterPredicate();
          this.aufgabenDataSource.sortingDataAccessor = (item:any, property) => {
            if(property === 'kurs'){
              return this.kursDict[item.kurs].toLowerCase();
            } else {
              return item[property];
            }
          }
          this.loading = false;
        }
      )
  }

  // Funktion, welche gerufen wird, sobald die Komponente nicht mehr gebraucht wird.
  ngOnDestroy(): void {
    this.aufgabenSub.unsubscribe();
    this.kursSub.unsubscribe();
  }

  // Öffnet Dialogfenster, wenn der Nutzer eine Aufgabe löschen möchte.
  onDelete(id:string, kurs:string){
    this.dialog.open(AufgabeDeleteDialogComponent, {
      data: {id: id, kurs:kurs},
      disableClose: true
    }).afterClosed().subscribe(result => {
      if(result.deleted){
        this.kursService.getKurse();
        this.snackBar.open("Aufgabe gelöscht.", "OK",{
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
      }
    });
  }

  // Stellt Parameter zur Verfügung für die URL, welche verwendet werden soll,
  // nach der Erstellung oder Bearbeitung einer Aufgabe.
  getReturnURL(){
     if(this.kursID){
       return {kursID:this.kursID};
     }
     return {};
  }

  // Aktualisiert Sortierung der Tabelle.
  onSort(){
     this.aufgabenDataSource.sort = this.sort;
  }

  // Aktualisiert Seite beim Seitenwechsel oder Änderung der Seitengrösse.
  onPage(){
    this.aufgabenDataSource.paginator = this.paginator;
  }

  // Aktualisiert Filter, sobald Eingabefelder verändert wurden.
  onFilter(){
    const suche = this.filterForm.value.sucheFC;
    const serie = this.filterForm.value.serieFC;
    const status = this.filterForm.value.statusFC;
    const start = this.filterForm.value.startFC;
    const end = this.filterForm.value.endFC;
    this.aufgabenDataSource.filter = suche + "," + serie + "," + status + "," + start + "," + end;
  }

  // Definiert die Filtrierung.
  filterPredicate() {
    return (data:any, _filter:any) => {
      const suche = this.filterForm.value.sucheFC;
      const serie = this.filterForm.value.serieFC;
      const status = this.filterForm.value.statusFC;
      const start = this.filterForm.value.startFC;
      const end = this.filterForm.value.endFC;

      // Überprüft auf Übereinstimmung mit dem Suchfeld.
      if(suche){
        if(!this.kursID){
          if(!this.kursDict[data.kurs].toLowerCase().includes(suche.toLowerCase()) && !data.kommentar.toLowerCase().includes(suche.toLowerCase())) return false;
        } else {
          if(!data.kommentar.toLowerCase().includes(suche.toLowerCase())) return false;
        }
      }

      // Überprüft auf Übereinstimmung mit dem Serien-Filter.
      if(serie){
        if (data.seriennummer != serie) return false;
      }

      // Überprüft auf Übereinstimmung mit dem Status-Filter.
      if(status){
        if (data.status != status) return false;
      }

      // Überprüft auf Übereinstimmung mit dem "Von"-Filter.
      if(start){
        if (!(new Date(data.faelligkeit) >= new Date(start))) return false;
      }

      // Überprüft auf Übereinstimmung mit dem "Bis"-Filter.
      if(end){
        if (!(new Date(data.faelligkeit) <= new Date(end))) return false;
      }

      return true;
    }
  }

  // Setzt Filter-Formular zurück.
  onClear(){
     this.filterForm.reset();
     this.onFilter();
  }

}

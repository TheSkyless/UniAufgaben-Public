import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {KursService} from "../kurs.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {KursDeleteDialogComponent} from "../kurs-löschen/kurs-delete-dialog.component";
import {MatTableDataSource} from "@angular/material/table";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'kurs-liste',
  templateUrl: 'kurs-liste.component.html',
  styleUrls: ['kurs-liste.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class KursListeComponent implements OnInit, OnDestroy{

  filterForm!:FormGroup; // Eingabefelder der Filter der Kursliste, definiert im Constructor.

  constructor(public kursService:KursService, public dialog:MatDialog, private snackBar:MatSnackBar) {
    this.filterForm = new FormGroup({
      sucheFC: new FormControl(null, []),
      semesterFC: new FormControl(null, [])
    });
  }

  private kursSub!: Subscription;
  kursDataSource = new MatTableDataSource(); // Datensatz für Tabelle.
  spalten = ['name','semester','fach'] // Spalten der Tabelle.
  spaltenErweitert = [...this.spalten,'optionen'] // Definiert den Inhalt einer geöffneten Zeile in der Tabelle.
  expandedElement:any; // Tatsächlicher Inhalt einer geöffneten Zeile in der Tabelle.
  @ViewChild(MatPaginator) paginator!:MatPaginator; // Unterteilt Tabelle in Seiten.
  @ViewChild(MatSort) sort!: MatSort; // Definiert Sortierung der Tabelle.

  loading = true; // Boolean für den Ladebalken.

  // Funktion, welche aufgerufen wird beim Erscheinen der Komponente.
  ngOnInit(){
    this.loading = true;

    // Ruft Kurse ab.
    this.kursService.getKurse();

    // Definiert Verhalten beim Abrufen von Kursen.
    this.kursSub = this.kursService.getUpdateListener()
      .subscribe((kursData) => {
        this.kursDataSource.data = kursData.kurse;
        this.kursDataSource.sort = this.sort;
        this.kursDataSource.paginator = this.paginator;
        this.kursDataSource.filterPredicate = this.filterPredicate();
        this.loading = false;
      });

  }

  // Funktion, welche gerufen wird, sobald die Komponente nicht mehr gebraucht wird.
  ngOnDestroy() {
    // Beendet Abonnement zum kursUpdateListener.
    this.kursSub.unsubscribe();
  }

  // Gibt Werte zurück für den Stand der Bewertung des Kurses.
  getProgress(benoetigt:number, bestanden:number){
    return (bestanden/benoetigt)*100;
  }

  // Öffnet beim Klicken auf "Kurs löschen" ein Bestätigungsdialog.
  onDelete(id: String, name: String){
    this.dialog.open(KursDeleteDialogComponent, {
      data: {
        id: id,
        name: name
      },
      disableClose: true
    }).afterClosed().subscribe(result => {
      if(result.deleted){
        this.kursService.getKurse();
        this.snackBar.open("Kurs gelöscht.", "OK",{
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
      }
    });
  }

  // Aktualisiert Sortierung der Tabelle.
  onSort(){
    this.kursDataSource.sort = this.sort;
  }

  // Aktualisiert Seite beim Seitenwechsel oder Änderung der Seitengrösse.
  onPage(){
    this.kursDataSource.paginator = this.paginator;
  }

  // Aktualisiert Filter, sobald Eingabefelder verändert wurden.
  onFilter(){
    const suche = this.filterForm.value.sucheFC;
    const semester = this.filterForm.value.semesterFC;
    this.kursDataSource.filter = suche + "," + semester;
  }

  // Definiert die Filtrierung.
  filterPredicate() {
    return (data:any, _filter:any) => {
      const suche = this.filterForm.value.sucheFC;
      const semester = this.filterForm.value.semesterFC;

      // Überprüft auf Übereinstimmung mit dem Suchfeld.
      if(suche){
        if(!data.name.toLowerCase().includes(suche.toLowerCase()) && !data.fach.toLowerCase().includes(suche.toLowerCase())) return false;
      }

      // Überprüft auf Übereinstimmung mit dem Semester-Filter.
      if(semester){
        if(data.semester != semester) return false;
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

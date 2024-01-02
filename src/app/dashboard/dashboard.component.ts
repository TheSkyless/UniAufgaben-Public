import {Component, OnDestroy, OnInit} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {AufgabenService} from "../aufgaben/aufgaben.service";
import {Subscription} from "rxjs";
import {KursService} from "../kurse/kurs.service";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy{

  constructor(private authService:AuthService, private aufgabenService:AufgabenService, private kursService:KursService) {}

  hourText!:string; // Begrüssung auf dem Dashboard.

  kursSub!:Subscription;
  kursDict:{[name:string]:string} = {}; // Wörterbuch, welches Namen und IDs von Kursen beinhaltet.

  aufgabenSub!:Subscription;
  aufgaben:any;

  count = 0; // Die Anzahl an offenen Aufgaben.
  count14 = 0; // Die Anzahl an offenen Aufgaben, welche fällig in den nächsten 14 Tagen sind.
  loading = false; // Boolean für den Ladebalken.

  // Funktion, welche aufgerufen wird beim Erscheinen der Komponente.
  ngOnInit(): void {
    this.loading = true;

    const curHour = new Date().getHours(); // Aktuelle Uhrzeit.
    const nutzername = this.authService.getNutzername();

    // If-else-Block, welcher die Grussnachricht bestimmt.
    if (curHour <= 11) this.hourText = `Guten Morgen, ${nutzername}.`;
    else if (curHour <= 17) this.hourText = `Guten Tag, ${nutzername}.`;
    else this.hourText = `Guten Abend, ${nutzername}.`;

    // Ruft die Kurse auf.
    this.kursService.getKurse();

    // Definiert das Verhalten beim Abrufen von Kursen.
    // Erst werden die Kurse ins Wörterbuch aufgenommen, anschliessend werden die
    // 5 dringendsten Aufgaben aufgerufen.
    this.kursSub = this.kursService.getUpdateListener().subscribe((kursData) => {
      const kurse = kursData.kurse;
      for (const i in kurse) {
        this.kursDict[kurse[i].id] = kurse[i].name;
      }
      this.aufgabenService.dashboard5();
    });

    // Definiert das Verhalten beim Abrufen von Aufgaben.
    this.aufgabenSub = this.aufgabenService.getUpdateListener().subscribe((aufgabenData) => {
      this.aufgaben = aufgabenData.aufgaben;
      this.updateStats();
    });
  }

  // Funktion, welche gerufen wird, sobald die Komponente nicht mehr gebraucht wird.
  ngOnDestroy(): void {
    // Beendet Abonnement zum updateListener von Kurse und Aufgaben.
    this.kursSub.unsubscribe();
    this.aufgabenSub.unsubscribe();
  }

  // Aktualisiert die count und count14 Werte auf dem Dashboard und blendet den Ladebalken aus.
  updateStats(){
    this.aufgabenService.getStats().subscribe((statData) => {
      this.count = statData.count;
      this.count14 = statData.count14;
      this.loading = false;
    })
  }
}

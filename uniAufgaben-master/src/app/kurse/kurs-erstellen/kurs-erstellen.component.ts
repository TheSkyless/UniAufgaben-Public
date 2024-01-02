import {Component, OnInit} from "@angular/core";
import {KursService} from "../kurs.service";
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {Kurs} from "../kurs.model";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'kurs-erstellen',
  templateUrl: 'kurs-erstellen.component.html',
  styleUrls: ['kurs-erstellen.component.scss']
})

export class KursErstellenComponent implements OnInit{

  kursFormular!:FormGroup; // Formular. Definiert im Constructor.

  constructor(public kursService:KursService,
              private authService:AuthService,
              public route:ActivatedRoute) {
    this.kursFormular = new FormGroup({
      nameFC: new FormControl("", [Validators.required]),
      semesterFC: new FormControl(1,[Validators.required]),
      fachFC: new FormControl("",[Validators.required]),
      bewertetFC: new FormControl(false,[Validators.required]),
      insgesamtFC: new FormControl(1, []),
      benoetigtFC: new FormControl(1, [])
    })
  }

  // Validator; stellt sicher, dass die min. erforderliche Anzahl an bestandenen Serien
  // nicht grösser ist als die Anzahl Serien insgesamt.
  minSerienValidator():ValidatorFn {
    return ():ValidationErrors | null => {
      const insgesamt = this.kursFormular.get('insgesamtFC')!.value;
      const benoetigt = this.kursFormular.get('benoetigtFC')!.value;

      if (insgesamt < benoetigt) {
        return {largerThanError: true};
      } else {
        return null;
      }
    };
  }

  loading = false; // Boolean für den Ladebalken.
  mode = 'create'; // Modus des Formulars.

  kurs?:any; // Alle Daten des Kurses.
  kursID?:any; // ID des Kurses.
  nutzerID:any; // ID des Nutzers.

  // Funktion, welche Aufgerufen wird, wenn die Komponente auf dem Nutzergerät erscheint.
  ngOnInit() {

    // Abrufen der Parameter der URL.
    this.route.paramMap.subscribe((paramMap) => {

      // Vorgehen, falls eine KursID angegeben wurde: Bearbeitungsmodus.
      if(paramMap.has('id')){
        this.loading = true;

        this.mode = 'edit';
        this.kursID = paramMap.get('id');

        // Formular mit bestehenden Daten füllen.
        this.kursService.getKurs(this.kursID)
          .subscribe((kursData) => {
            this.loading = false;
            this.kurs = kursData;
            this.kursFormular.get("nameFC")!.patchValue(kursData.name);
            this.kursFormular.get("semesterFC")!.patchValue(kursData.semester);
            this.kursFormular.get("fachFC")!.patchValue(kursData.fach);
            this.kursFormular.get("bewertetFC")!.patchValue(kursData.bewertet);
            this.kursFormular.get("insgesamtFC")!.patchValue(kursData.serien_insgesamt);
            this.kursFormular.get("benoetigtFC")!.patchValue(kursData.serien_benoetigt);
            this.onChangeBewertet();
          });
      }
    });
    this.nutzerID = this.authService.getNutzerID();
  }

  // Überprüfung, wenn die gesamte Anzahl und/oder minimale Anzahl an Serien verändert wurde.
  onChangeBewertet(){
    if(this.kursFormular.value.bewertetFC){
      this.kursFormular.get("insgesamtFC")!.addValidators([Validators.required]);
      this.kursFormular.get("benoetigtFC")!.addValidators([Validators.required, this.minSerienValidator()]);
    } else {
      this.kursFormular.get("insgesamtFC")!.clearValidators();
      this.kursFormular.get("benoetigtFC")!.clearValidators();
    }
    this.kursFormular.get("insgesamtFC")!.updateValueAndValidity();
    this.kursFormular.get("benoetigtFC")!.updateValueAndValidity();
  }

  // Gültigkeit der Serienanzahl aktualisieren.
  updateSerienValidity(){
    this.kursFormular.get("benoetigtFC")!.updateValueAndValidity();
  }

  // Speichern des Kurses.
  onAddPost(){
    // Falls Formular ungültig: Speichern abbrechen.
    if(this.kursFormular.invalid) return;

    this.loading = true;

    const kurs:Kurs = {
      bewertet: this.kursFormular.value.bewertetFC,
      fach: this.kursFormular.value.fachFC,
      id: "",
      name: this.kursFormular.value.nameFC,
      nutzer: this.nutzerID,
      semester: this.kursFormular.value.semesterFC,
      serien_benoetigt: this.kursFormular.value.benoetigtFC ? this.kursFormular.value.benoetigtFC : 0,
      serien_bestanden: this.kurs?.serien_bestanden ? this.kurs.serien_bestanden : 0,
      serien_nicht_bestanden: this.kurs?.serien_nicht_bestanden ? this.kurs.serien_nicht_bestanden : 0,
      serien_insgesamt: this.kursFormular.value.insgesamtFC ? this.kursFormular.value.insgesamtFC : 0
    }

    if(this.mode === 'create'){
      this.kursService.addKurs(kurs);
    } else {
      kurs.id = this.kursID;
      this.kursService.editKurs(kurs);
    }
  }
}

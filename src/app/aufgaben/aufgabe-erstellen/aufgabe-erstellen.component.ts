import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AufgabenService} from "../aufgaben.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Aufgabe} from "../aufgaben.model";
import {KursService} from "../../kurse/kurs.service";
import {Kurs} from "../../kurse/kurs.model";
import {concatMap} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

enum status {
  "Offen" = 0,
  "Abgegeben" = 1,
  "Nicht bestanden" = 2,
  "Bestanden" = 3
}

@Component({
  selector: 'aufgabe-erstellen',
  templateUrl: 'aufgabe-erstellen.component.html',
  styleUrls: ['aufgabe-erstellen.component.scss']
})
export class AufgabeErstellenComponent implements OnInit, OnDestroy{

  aufgabenFormular!:FormGroup;

  constructor(public aufgabenService:AufgabenService,
              public kursService:KursService,
              private authService:AuthService,
              private snackBar:MatSnackBar,
              public route:ActivatedRoute,
              private router:Router) {
    this.aufgabenFormular = new FormGroup({
      kursFC: new FormControl(null, [Validators.required]),
      seriennummerFC: new FormControl(1, [Validators.required]),
      faelligkeitFC: new FormControl(new Date(), [Validators.required]),
      statusFC: new FormControl(0,[Validators.required]),
      kommentarFC: new FormControl("",[])
    })
  }

  loading = false;
  kurseLoading = true;
  mode = 'create'

  kurse:Kurs[] = [];
  initKursID!:any;
  kursSub!:any;

  aufgabe?:Aufgabe;
  aufgabenID?:any;
  nutzerID:any;
  returnURL?:any;

  timezoneOffset!:number;

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {

      this.timezoneOffset = new Date().getTimezoneOffset() * 60000;

      if(paramMap.has('id')){
        this.loading = true;

        this.mode = 'edit';
        this.aufgabenID = paramMap.get('id');

        this.aufgabenService.getAufgabe(this.aufgabenID)
          .subscribe((aufgabenData) => {
            this.loading = false;

            const date = new Date(aufgabenData.faelligkeitsdatum);

            this.initKursID = aufgabenData.kurs;

            this.aufgabenFormular.get("kursFC")!.patchValue(aufgabenData.kurs);
            this.aufgabenFormular.get("seriennummerFC")!.patchValue(aufgabenData.seriennummer);
            this.aufgabenFormular.get("faelligkeitFC")!.patchValue(date);
            this.aufgabenFormular.get("kommentarFC")!.patchValue(aufgabenData.kommentar);
            this.aufgabenFormular.get("statusFC")!.patchValue(aufgabenData.status);
        })
      } else {
        const curTime = new Date();
        this.aufgabenFormular.get("faelligkeitFC")!.patchValue(curTime);
      }

      this.route.queryParamMap.subscribe((queryMap) => {
        if(queryMap.has('kursID')){
          this.returnURL = "/aufgaben/"+queryMap.get('kursID');
          if(!paramMap.has('id')){
            this.aufgabenFormular.get("kursFC")!.patchValue(queryMap.get('kursID'));
          }
        } else {
          this.returnURL = "/aufgaben"
        }
      })
    })


    this.kursSub = this.kursService.getUpdateListener()
      .subscribe((kursData:{kurse:Kurs[]}) => {
        this.kurse = kursData.kurse;
        this.kurseLoading = false;
      });
    this.kursService.getKurse();

    this.nutzerID = this.authService.getNutzerID();
  }

  ngOnDestroy() {
    this.kursSub.unsubscribe();
  }

  getKurse(isOpen: boolean) {
    if (isOpen) {
      this.kurseLoading = true;
      this.kursService.getKurse();
    }
  }

  onAddAufgabe(){
    if(this.aufgabenFormular.invalid) return;

    this.loading = true;

    const aufgabe:Aufgabe = {
      faelligkeitsdatum: new Date(this.aufgabenFormular.value.faelligkeitFC),
      id: "",
      kommentar: this.aufgabenFormular.value.kommentarFC,
      kurs: this.aufgabenFormular.value.kursFC,
      nutzer: this.nutzerID,
      seriennummer: this.aufgabenFormular.value.seriennummerFC,
      status: this.aufgabenFormular.value.statusFC
    }

    if(this.mode === 'create'){
      this.aufgabenService.addAufgabe(aufgabe)
          .pipe(
              concatMap(() => {return this.kursService.updateBewertung(aufgabe.kurs)})
          ).subscribe(() => {
            this.router.navigate([this.returnURL]);
            this.snackBar.open("Aufgabe erstellt.", "OK",{
              duration: 5000,
              horizontalPosition: "center",
              verticalPosition: "top"
            });
          })
    } else {
      aufgabe.id = this.aufgabenID;

      if(aufgabe.kurs != this.initKursID){
        this.aufgabenService.editAufgabe(aufgabe)
            .pipe(
                concatMap(() => {return this.kursService.updateBewertung(this.initKursID);}),
                concatMap(() => {return this.kursService.updateBewertung(aufgabe.kurs);})
            ).subscribe(() => {
              this.router.navigate([this.returnURL])
              this.snackBar.open("Aufgabe gespeichert.", "OK",{
                duration: 5000,
                horizontalPosition: "center",
                verticalPosition: "top"
          });
            });
      } else {
        this.aufgabenService.editAufgabe(aufgabe)
            .pipe(
                concatMap(() => {return this.kursService.updateBewertung(aufgabe.kurs)})
            ).subscribe(() => {
              this.router.navigate([this.returnURL]);
              this.snackBar.open("Aufgabe gespeichert.", "OK",{
                duration: 5000,
                horizontalPosition: "center",
                verticalPosition: "top"
              });
            });
      }
    }
  }

  protected readonly status = status;
}

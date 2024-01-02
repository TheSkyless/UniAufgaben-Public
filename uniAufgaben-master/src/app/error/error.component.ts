import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  templateUrl: './error.component.html'
})

export class ErrorComponent{

  constructor(
    // Beinhaltet die Fehlernachricht für das Dialogfenster.
    @Inject(MAT_DIALOG_DATA) public data: {message:string}
  ){}

}

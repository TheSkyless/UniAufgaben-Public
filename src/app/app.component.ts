import {Component, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'uniAufgaben';

  constructor(private authService:AuthService) {}

  ngOnInit() {
    // Rufe Anmeldedaten vom Endnutzergerät ab.
    this.authService.autoAuth();
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {KursListeComponent} from "./kurse/kurs-liste/kurs-liste.component";
import {KursErstellenComponent} from "./kurse/kurs-erstellen/kurs-erstellen.component";
import {AufgabenListeComponent} from "./aufgaben/aufgaben-liste/aufgaben-liste.component";
import {AufgabeErstellenComponent} from "./aufgaben/aufgabe-erstellen/aufgabe-erstellen.component";
import {LoginComponent} from "./auth/login/login.component";
import {SignupComponent} from "./auth/signup/signup.component";
import {AuthGuard} from "./auth/auth.guard";
import {AccountComponent} from "./auth/account/account.component";
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes: Routes = [
  {path: '', component: DashboardComponent, canActivate:[AuthGuard]},
  {path: 'kurse', component: KursListeComponent, canActivate:[AuthGuard]},
  {path: 'kurs/neu', component: KursErstellenComponent, canActivate:[AuthGuard]},
  {path: 'kurs/bearbeiten/:id', component: KursErstellenComponent, canActivate:[AuthGuard]},
  {path: 'aufgaben', component: AufgabenListeComponent, canActivate:[AuthGuard]},
  {path: 'aufgaben/:id', component: AufgabenListeComponent, canActivate:[AuthGuard]},
  {path: 'aufgabe/neu', component: AufgabeErstellenComponent, canActivate:[AuthGuard]},
  {path: 'aufgabe/bearbeiten/:id', component: AufgabeErstellenComponent, canActivate:[AuthGuard]},
  {path: 'konto', component: AccountComponent, canActivate:[AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

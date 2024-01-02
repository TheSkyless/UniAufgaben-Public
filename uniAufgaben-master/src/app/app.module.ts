import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AppRoutingModule} from './app-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from '@angular/material/table';
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule} from "@angular/material/core";

import {AppComponent} from './app.component';
import {HeaderComponent} from "./header/header.component";
import {KursListeComponent} from "./kurse/kurs-liste/kurs-liste.component";
import {KursErstellenComponent} from "./kurse/kurs-erstellen/kurs-erstellen.component";
import {KursDeleteDialogComponent} from "./kurse/kurs-löschen/kurs-delete-dialog.component";
import {AufgabenListeComponent} from "./aufgaben/aufgaben-liste/aufgaben-liste.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AufgabeErstellenComponent} from "./aufgaben/aufgabe-erstellen/aufgabe-erstellen.component";
import {AufgabeDeleteDialogComponent} from "./aufgaben/aufgabe-löschen/aufgabe-delete-dialog.component";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {paginatorDeutsch} from "./lang/paginator/paginator-deutsch";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {LoginComponent} from "./auth/login/login.component";
import {SignupComponent} from "./auth/signup/signup.component";
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import {MtxDatetimepickerIntl, MtxDatetimepickerModule} from "@ng-matero/extensions/datetimepicker";
import {MtxNativeDatetimeModule} from "@ng-matero/extensions/core";
import {AuthInterceptor} from "./auth/auth-interceptor";
import {ErrorComponent} from "./error/error.component";
import {AccountComponent} from "./auth/account/account.component";
import {AccountDeleteDialogComponent} from "./auth/account/account-löschen/account-delete-dialog.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {datetimepickerDeutsch} from "./lang/datetimepicker/datetimepicker-deutsch";
import {NgOptimizedImage} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    KursListeComponent,
    KursErstellenComponent,
    KursDeleteDialogComponent,
    AufgabenListeComponent,
    AufgabeErstellenComponent,
    AufgabeDeleteDialogComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent,
    AccountComponent,
    AccountDeleteDialogComponent,
    DashboardComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    MatRippleModule,
    NgOptimizedImage
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'de-CH'},
    {provide: MtxDatetimepickerIntl, useValue: datetimepickerDeutsch()},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}},
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {}},
    {provide: MatPaginatorIntl, useValue: paginatorDeutsch()},
    {provide: HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CountrySelectorComponent } from './country-selector/country-selector.component';
import { MatButtonModule } from '@angular/material/button';
import { CountryDetailsComponent } from './country-details/country-details.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ProvincesChartComponent } from 'src/app/country-details/provinces-chart/provinces-chart.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';



@NgModule({
  declarations: [AppComponent, HeaderComponent, CountrySelectorComponent, CountryDetailsComponent, ProvincesChartComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { HttpInterceptorService } from 'src/app/shared/services/http-interceptor.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CountryDetailsComponent } from './country-details/country-details.component';
import { CountrySelectorComponent } from './country-selector/country-selector.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './country-details/map/map.component';
import { NetworkErrorComponent } from './network-error/network-error.component';
import { ProvincesChartComponent } from './country-details/provinces-chart/provinces-chart.component';
import { RefreshComponent } from './refresh/refresh.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CountrySelectorComponent,
    CountryDetailsComponent,
    ProvincesChartComponent,
    MapComponent,
    NetworkErrorComponent,
    RefreshComponent,
  ],
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
    MatNativeDateModule,
    MatInputModule,
    MatCardModule,
    HttpClientModule,
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'it' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

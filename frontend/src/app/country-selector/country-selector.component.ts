import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { CovidDataService } from 'src/app/shared/services/covid-data.service';

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent implements OnInit{
  public currentCountry: string;
  public isDisabled: boolean;
  public isInfoLoaded = false;
  public allData: any;

  public constructor(private CovidSvc: CovidDataService) {}

  public ngOnInit(): void {
    // TODO: create an endpoint to get only cases values and not all dataset
    this.CovidSvc.getAllDataset().subscribe((res) => {
      this.isInfoLoaded = true;
      this.allData = res;
    });
  }

  public setCurrentCountry(country: string): void {
    this.currentCountry = country;
  }
}

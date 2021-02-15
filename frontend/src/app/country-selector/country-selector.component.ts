import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { concat } from 'rxjs';
import { RegionMapperService } from 'src/app/shared/services/region-mapper.service';

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent implements OnInit{
  public currentCountry: string;
  public isDisabled: boolean;
  public isInfoLoaded = false;
  public totalCases: any; // remove
  private date: string;

  public italyCases: any;
  public belgiumCases: number;
  public UKCases: number;

  public constructor(private regionMapperSvc: RegionMapperService) {
    const today = new Date();
    let day = today.getDay() + 12; // +12 because we print the cases of the day before yesterday
    let month: string | number = today.getMonth() + 1;
    if(month < 10) {
      month = '0' + month;
    }
    let year = today.getFullYear();
    this.date = year + '-' + month + '-' + day;
  }

  public ngOnInit(): void {
    // TODO: create an endpoint to get only cases values and not all dataset
    // this.CovidSvc.getAllDataset().subscribe((res) => {
    //   this.isInfoLoaded = true;
    //   this.allData = res;
    // });

    // this.CovidSvc.getItalyData(this.date).subscribe((res) => {
    //   this.italyCases = res;
    // });

    this.regionMapperSvc.getCases(this.date).subscribe((res) => {
      this.italyCases = res[0].italy[0].cases;
      this.belgiumCases = res[1].belgium[0].cases;
      this.UKCases = res[2].uk[0].cases;
      this.isInfoLoaded = true;
    });

  }

  public setCurrentCountry(country: string): void {
    this.currentCountry = country;
  }

}

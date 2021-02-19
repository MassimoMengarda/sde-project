import { Component, OnInit } from '@angular/core';
import { RegionMapperService } from 'src/app/shared/services/region-mapper.service';

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent implements OnInit {
  public currentCountry: string;
  public isInfoLoaded = false;

  public italyCases: any;
  public belgiumCases: number;
  public UKCases: number;

  public constructor(private regionMapperSvc: RegionMapperService) {}

  public ngOnInit(): void {
    this.getLast24hCases();
  }

  // Function to gets the latest available cases
  private getLast24hCases() {
    this.regionMapperSvc.getCases().subscribe((res) => {
      this.italyCases = res[0].italy[0].cases;
      this.belgiumCases = res[1].belgium[0].cases;
      this.UKCases = res[2].uk[0].cases;
      this.isInfoLoaded = true;
    });
  }

  // Function to set teh current country, used by template
  public setCurrentCountry(country: string): void {
    this.currentCountry = country;
  }
}

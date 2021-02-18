import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent implements OnChanges {
  @Input() country: string;
  public selectedCountry: string = '';

  public constructor() {}

  public ngOnChanges(): void {
    if (this.country === 'IT') this.selectedCountry = 'Italy';
    else if (this.country === 'BG') this.selectedCountry = 'Belgium';
    else if (this.country === 'UK') this.selectedCountry = 'UK';
  }
}

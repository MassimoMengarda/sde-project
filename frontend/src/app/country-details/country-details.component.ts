import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent implements OnChanges {
  // Input value from country-selector component
  @Input() country: string;

  public selectedCountry: string = '';

  public constructor() {}

  // Function to sets the current country based on @Input value
  public ngOnChanges(): void {
    if (this.country === 'IT') this.selectedCountry = 'Italy';
    else if (this.country === 'BG') this.selectedCountry = 'Belgium';
    else if (this.country === 'UK') this.selectedCountry = 'UK';
  }
}

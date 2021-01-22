import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent {
  public currentCountry: string;
  public isDisabled: boolean;

  constructor() {}

  public setCurrentCountry(country: string): void {
    this.currentCountry = country;
  }
}

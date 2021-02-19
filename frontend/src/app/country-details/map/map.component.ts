import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges {
  // Input value from country-details component
  @Input() country: string;

  public date: string;
  public mapImage: any;
  public isMapLoading = true;

  // Control of date picker
  public dateControl: FormControl;

  public maxDateToSelect = new Date();

  public constructor(private mapSvc: MapService, private datePipe: DatePipe) {}

  public ngOnChanges(): void {
    this.initDateFormControl();
    this.getInitialDate();
    this.getMapImage();
  }

  // Function to initialize the date picker form control
  private initDateFormControl() {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    // Set yesterday's date, setting the maximum date in the date picker
    // to yesterday: it is not possible to get today's map because today's
    // data is not yet available
    if (this.country.toLowerCase().includes('belgium')) {
      this.dateControl = new FormControl(new Date(year, month, day - 2));
      this.maxDateToSelect.setDate(today.getDate() - 2);
    } else {
      this.dateControl = new FormControl(new Date(year, month, day - 1));
      this.maxDateToSelect.setDate(today.getDate() - 1);
    }
  }

  // Function to gets the date from date picker
  private getInitialDate() {
    this.date = this.datePipe.transform(this.dateControl.value, 'yyyy-MM-dd');
  }

  // Function to retrieves the map image using the map service
  private getMapImage() {
    this.isMapLoading = true;
    this.mapImage = '';
    this.mapSvc.getMap(this.country.toLowerCase(), this.date).subscribe(
      (data) => {
        this.createImageFromBlob(data);
        this.isMapLoading = false;
      },
      (error) => {
        this.isMapLoading = false;
        console.log(error);
      }
    );
  }

  // Function to intercepets the date changes and update 'date' variable
  public dateChange(event) {
    this.date = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  }

  // Support function to transfor the blob into an image
  private createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.mapImage = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}

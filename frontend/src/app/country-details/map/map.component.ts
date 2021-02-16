import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnChanges {
  @Input() country: string;
  public date: string;
  public mapImage: any;
  public isMapLoading = true;

  public dateControl: FormControl;

  public constructor(private mapSvc: MapService, private datePipe: DatePipe) {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    this.dateControl = new FormControl(new Date(year, month, day - 1));

  }

  public ngOnChanges(): void {
    this.getInitialDateRange();

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

  private getInitialDateRange() {
    this.date = this.datePipe.transform(this.dateControl.value, 'yyyy-MM-dd');
  }

  public dateChange(event) {
    this.date = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  }

  private createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.mapImage = reader.result;
    }, false);

    if (image) {
       reader.readAsDataURL(image);
    }
 }

}

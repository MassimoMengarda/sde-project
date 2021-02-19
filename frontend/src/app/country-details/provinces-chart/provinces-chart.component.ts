import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChartService } from 'src/app/shared/services/chart.service';
import { DatesMapperService } from 'src/app/shared/services/dates-mapper.service';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss'],
})
export class ProvincesChartComponent implements OnChanges {
  // Input value from country-selector component
  @Input() country: string;

  // Control of date range picker
  public range: FormGroup;

  // Data strucuture used to save the pair <province, cases per province>
  public provincesBox = new Map<string, number>();

  // Array used from template to display the content of provincesBox
  public provincesEntries: any;

  private startDate: string;
  private endDate: string;

  public chartImage: any;
  public isChartLoading = true;

  public maxDateToSelect = new Date();

  public constructor(
    private datesMapperSvc: DatesMapperService,
    private chartSvc: ChartService,
    private datePipe: DatePipe
  ) {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    // Set the start date to 7 days before today and the end date to the day before yesterday.
    // Thanks to this, the component shows the data of the last week
    this.range = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day - 2)),
    });

    // Set the max date to select to yesterday, because today's
    // data is not yet available
    this.maxDateToSelect.setDate(today.getDate() - 1);
  }

  public ngOnChanges(): void {
    this.getInitialDateRange();
    this.selectCountry();
  }

  // Function to gets the date range from date picker
  private getInitialDateRange() {
    this.startDate = this.datePipe.transform(
      this.range.value.start,
      'yyyy-MM-dd'
    );
    this.endDate = this.datePipe.transform(this.range.value.end, 'yyyy-MM-dd');
  }

  private selectCountry() {
    // Empty the structure if still contains the previous data from the previous country
    this.provincesBox.clear();
    this.getCasesAndChart();
  }

  // Function to intercepets the start date changes and update 'startDate' variable
  public startChange(): void {
    this.startDate = this.datePipe.transform(
      this.range.value.start,
      'yyyy-MM-dd'
    );
  }

  // Function to intercepets the end date changes and update 'endDate' variable
  public endChange(event): void {
    if (event.value) {
      this.endDate = this.datePipe.transform(
        this.range.value.end,
        'yyyy-MM-dd'
      );
      this.selectCountry();
    }
  }

  // Function to retrieves the cases per province
  private getCasesAndChart() {
    this.datesMapperSvc
      .getData(this.country.toLowerCase(), this.startDate, this.endDate)
      .subscribe((res) => {
        const cases: number[] = [];
        const currentCountry = this.country.toLowerCase();

        // Initialize the array to 0
        for (let p in res[currentCountry][0].provinces) {
          cases[p] = 0;
        }

        // Sum the cases day per day (for each province)
        res[currentCountry].forEach((day) => {
          for (let p in day.provinces) {
            cases[p] += day.provinces[p].cases;
            // TODO: set necessario solo ultima volta, trovare modo per non fare un altro ciclo for
            this.provincesBox.set(p, cases[p]);
          }
        });

        // For avoiding the "change view in html" error
        this.provincesEntries = Array.from(this.provincesBox.entries());
      });
    this.getChart();
  }

  // Function to retrieve the chart image usign the chart service
  private getChart() {
    this.isChartLoading = true;
    this.chartSvc
      .getChart(this.country.toLowerCase(), this.startDate, this.endDate)
      .subscribe(
        (data) => {
          this.createImageFromBlob(data);
          this.isChartLoading = false;
        },
        (error) => {
          this.isChartLoading = false;
          console.log(error);
        }
      );
  }

  // Support function to transfor the blob into an image
  private createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.chartImage = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}

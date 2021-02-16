import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ChartService } from 'src/app/shared/services/chart.service';
import { DatesMapperService } from 'src/app/shared/services/dates-mapper.service';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss'],
})
export class ProvincesChartComponent implements OnChanges {
  @Input() country: string;
  public range: FormGroup;
  public provincesBox = new Map<string, number>();
  public provincesEntries;

  private startDate: string;
  private endDate: string;

  public chartImage: any;
  public isChartLoading = true;

  public constructor(
    private datesMapperSvc: DatesMapperService,
    private chartSvc: ChartService,
    private datePipe: DatePipe
  ) {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    this.range = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day - 2)),
    });
  }

  public ngOnChanges(): void {
    this.getInitialDateRange();

    this.selectCountry();
  }

  private getInitialDateRange() {
    this.startDate = this.datePipe.transform(
      this.range.value.start,
      'yyyy-MM-dd'
    );
    this.endDate = this.datePipe.transform(this.range.value.end, 'yyyy-MM-dd');
  }

  private selectCountry() {
    //Svuoto nel caso ci siano dentro le vecchie entries di altri stati
    this.provincesBox.clear();

    if (this.country === 'Italy') {
      this.getItalyCasesAndChart(this.startDate, this.endDate);
    } else if (this.country === 'Belgium') {
      this.getBelgiumCasesAndChart(this.startDate, this.endDate);
    } else {
      this.getUKCasesAndChart(this.startDate, this.endDate);
    }
  }

  public startChange(event): void {
    this.startDate = this.datePipe.transform(
      this.range.value.start,
      'yyyy-MM-dd'
    );
  }
  public endChange(event): void {
    if (event.value) {
      this.endDate = this.datePipe.transform(
        this.range.value.end,
        'yyyy-MM-dd'
      );
      this.selectCountry();
    }
  }

  private getItalyCasesAndChart(startDate: string, endDate: string) {
    this.datesMapperSvc.getItalyData(startDate, endDate).subscribe((res) => {
      const provinces = res.italy[0].provinces;
      for (let p in provinces) {
        // console.log('P: ' + p + ' ' + provinces[p].cases);
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());

    });
    this.getChart();
  }

  private getChart() {
    this.isChartLoading = true;
    this.chartSvc.getChart(this.country.toLowerCase(), this.startDate, this.endDate).subscribe(
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

  private getBelgiumCasesAndChart(startDate: string, endDate: string) {
    this.datesMapperSvc.getBelgiumData(startDate, endDate).subscribe((res) => {
      const provinces = res.belgium[0].provinces;
      for (let p in provinces) {
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());
    });
    this.getChart();
  }

  private getUKCasesAndChart(startDate: string, endDate: string) {
    this.datesMapperSvc.getUKData(startDate, endDate).subscribe((res) => {
      const provinces = res.uk[0].provinces;
      for (let p in provinces) {
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());
    });
    this.getChart();
  }

  private createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.chartImage = reader.result;
    }, false);

    if (image) {
       reader.readAsDataURL(image);
    }
 }
}

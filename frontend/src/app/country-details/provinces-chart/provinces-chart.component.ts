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
  @Input() country: string;
  public range: FormGroup;
  public provincesBox = new Map<string, number>();
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

    this.range = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day - 2)),
    });

    this.maxDateToSelect.setDate(today.getDate() - 1);
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
    this.getCasesAndChart();
  }

  public startChange(): void {
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

  private getCasesAndChart() {
    this.datesMapperSvc
      .getData(this.country.toLowerCase(), this.startDate, this.endDate)
      .subscribe((res) => {
        const cases: number[] = [];
        const currentCountry = this.country.toLowerCase();

        // Inizializzo
        for (let p in res[currentCountry][0].provinces) {
          cases[p] = 0;
        }

        // Sommo i casi giorno per giorno (per ogni prov)
        res[currentCountry].forEach((day) => {
          for (let p in day.provinces) {
            cases[p] += day.provinces[p].cases;
            // TODO: set necessario solo ultima volta, trovare modo per non fare un altro ciclo for
            this.provincesBox.set(p, cases[p]);
          }
        });

        // Trucco per evitare l'errore "change view in html"
        this.provincesEntries = Array.from(this.provincesBox.entries());
      });
    this.getChart();
  }

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

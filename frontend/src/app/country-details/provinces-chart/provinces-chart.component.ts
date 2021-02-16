import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatesMapperService } from 'src/app/shared/services/dates-mapper.service';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss']
})
export class ProvincesChartComponent implements OnChanges {
  @Input() country: string;
  public range: FormGroup;
  public provincesBox = new Map<string, number>();
  public provincesEntries;

  public provincesName:string[] = [];

  public constructor(private datesMapperSvc: DatesMapperService, private datePipe: DatePipe) {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    this.range = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day - 2))
    });
  }

  public ngOnChanges(): void {
    const startDate = this.datePipe.transform(this.range.value.start, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this.range.value.end, 'yyyy-MM-dd');

    //Svuoto nel caso ci siano dentro le vecchie entries di altri stati
    this.provincesBox.clear();

    if (this.country === 'Italy') {
      this.getItalyCasesProvinces(startDate, endDate);
    } else if (this.country === 'Belgium') {
      this.getBelgiumCasesProvinces(startDate, endDate);
    } else {
      this.getUKCasesProvinces(startDate, endDate);
    }
  }

  private getItalyCasesProvinces(startDate: string, endDate: string) {
    this.datesMapperSvc.getItalyData(startDate, endDate).subscribe(res => {
      const provinces = res.italy[0].provinces;
      for (let p in provinces) {
        // console.log('P: ' + p + ' ' + provinces[p].cases);
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());
    });
  }

  private getBelgiumCasesProvinces(startDate: string, endDate: string) {
    this.datesMapperSvc.getBelgiumData(startDate, endDate).subscribe(res => {
      const provinces = res.belgium[0].provinces;
      for (let p in provinces) {
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());
    });
  }

  private getUKCasesProvinces(startDate: string, endDate: string) {
    this.datesMapperSvc.getUKData(startDate, endDate).subscribe(res => {
      const provinces = res.uk[0].provinces;
      for (let p in provinces) {
        this.provincesBox.set(p, provinces[p].cases);
      }

      // Trucco per evitare l'errore "change view in html"
      this.provincesEntries = Array.from(this.provincesBox.entries());
    });
  }
}

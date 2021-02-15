import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatesMapperService } from 'src/app/shared/services/dates-mapper.service';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss']
})
export class ProvincesChartComponent implements OnInit {
  public range: FormGroup;
  public provincesBox: Map<string, number>; // ?

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

  public ngOnInit(): void {
    const startDate = this.datePipe.transform(this.range.value.start, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this.range.value.end, 'yyyy-MM-dd');
    this.datesMapperSvc.getItalyData(startDate, endDate).subscribe(res => {
      const provinces = res.italy[0].provinces;
      for (let p in provinces) {
        this.provincesName.push(p);
        // this.provincesBox = new Map<string, number>();
        // this.provincesBox[p] = <number> p.cases;
      }

      console.log(res.italy[0].provinces.Abruzzo.cases);

      // const x = res.italy[0];
      // x.forEach(day => {
      //   for (let p in day.provinces) {
      //     console.log(p);
      //   }
      // });
    });
  }

}

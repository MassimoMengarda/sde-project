import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss']
})
export class ProvincesChartComponent implements OnInit {
  public range: FormGroup;

  public constructor() {
    const today = new Date();
    const day = today.getDay() + 14;
    const month = today.getMonth();
    const year = today.getFullYear();

    this.range = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day))
    });
  }

  public ngOnInit(): void {

  }

}

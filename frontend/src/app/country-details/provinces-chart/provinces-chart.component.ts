import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-provinces-chart',
  templateUrl: './provinces-chart.component.html',
  styleUrls: ['./provinces-chart.component.scss']
})
export class ProvincesChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

}

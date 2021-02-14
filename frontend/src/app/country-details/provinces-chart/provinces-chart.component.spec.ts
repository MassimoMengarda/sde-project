import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvincesChartComponent } from './provinces-chart.component';

describe('ProvincesChartComponent', () => {
  let component: ProvincesChartComponent;
  let fixture: ComponentFixture<ProvincesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvincesChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvincesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Dataset } from 'src/app/shared/models/dataset.model';
import { RegionDataset } from 'src/app/shared/models/region-dataset.model';

@Injectable({
  providedIn: 'root'
})
export class CovidDataService {
  private baseUrl = 'http://localhost:8080/';

  public constructor(private httpSvc: HttpClient) { }

  private getDataset(region: string): Observable<Dataset> {
    return this.httpSvc.get<Dataset>(this.baseUrl + region);
  }

  private getRegionData(region: string, date: string): Observable<RegionDataset> {
    return this.httpSvc.get<RegionDataset>(
      this.baseUrl + 'region-mapper/' + region + '?date=' + date);
  }

  public getAllDataset(): Observable<Dataset> {
    return this.httpSvc.get<Dataset>(this.baseUrl + 'data');
  }

  public getItalyFromAllDataset(): Observable<Dataset> {
    return this.getDataset('italy');
  }

  public getBelgiumFromAllDataset(): Observable<Dataset> {
    return this.getDataset('belgium');
  }

  public getUKFromAllDataset(): Observable<Dataset> {
    return this.getDataset('uk');
  }

  public getItalyData(date: string): Observable<RegionDataset> {
    return this.getRegionData('italy', date);
  }

  public getBelgiumData(date: string): Observable<RegionDataset> {
    return this.getRegionData('belgium', date);
  }

  public getUKData(date: string): Observable<RegionDataset> {
    return this.getRegionData('uk', date);
  }

  public getCases(date: string): Observable<any> {
    const italy = this.getItalyData(date);
    const belgium = this.getBelgiumData(date);
    const uk = this.getUKData(date);

    return forkJoin([italy, belgium, uk]);
  }
}

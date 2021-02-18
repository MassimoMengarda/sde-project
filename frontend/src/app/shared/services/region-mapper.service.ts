import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Dataset } from 'src/app/shared/models/dataset.model';
import { RegionDataset } from 'src/app/shared/models/region-dataset.model';

@Injectable({
  providedIn: 'root',
})
export class RegionMapperService {
  private baseUrl = 'http://localhost:8080/';

  public constructor(private httpSvc: HttpClient) {}

  private getDataset(region: string): Observable<Dataset> {
    return this.httpSvc.get<Dataset>(this.baseUrl + region);
  }

  private getRegionData(region: string): Observable<RegionDataset> {
    return this.httpSvc.get<RegionDataset>(this.baseUrl + 'data/latest/' + region);
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

  public getItalyData(): Observable<RegionDataset> {
    return this.getRegionData('italy');
  }

  public getBelgiumData(): Observable<RegionDataset> {
    return this.getRegionData('belgium');
  }

  public getUKData(): Observable<RegionDataset> {
    return this.getRegionData('uk');
  }

  public getCases(): Observable<any> {
    const italy = this.getItalyData();
    const belgium = this.getBelgiumData();
    const uk = this.getUKData();

    return forkJoin([italy, belgium, uk]);
  }
}

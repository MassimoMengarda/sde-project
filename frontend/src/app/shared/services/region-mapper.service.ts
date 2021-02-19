import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { RegionDataset } from 'src/app/shared/models/region-dataset.model';

@Injectable({
  providedIn: 'root',
})
export class RegionMapperService {
  private baseUrl = 'http://localhost:8080/';

  public constructor(private httpSvc: HttpClient) {}

  private getRegionData(region: string): Observable<RegionDataset> {
    return this.httpSvc.get<RegionDataset>(
      this.baseUrl + 'data/latest/' + region
    );
  }

  public getCases(): Observable<any> {
    const italy = this.getRegionData('italy');
    const belgium = this.getRegionData('belgium');
    const uk = this.getRegionData('uk');

    return forkJoin([italy, belgium, uk]);
  }
}

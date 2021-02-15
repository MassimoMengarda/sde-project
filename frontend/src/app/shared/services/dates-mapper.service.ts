import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegionDataset } from 'src/app/shared/models/region-dataset.model';

@Injectable({
  providedIn: 'root',
})
export class DatesMapperService {
  private baseUrl = 'http://localhost:8080/dates-mapper/';

  public constructor(private httpSvc: HttpClient) {}

  private getData(
    country: string,
    startDate: string,
    toDate: string
  ): Observable<RegionDataset> {
    return this.httpSvc.get<RegionDataset>(
      this.baseUrl + country + '?from=' + startDate + '&to=' + toDate
    );
  }

  public getItalyData(startDate: string, toDate: string): Observable<any> {
    return this.getData('italy', startDate, toDate);
  }
}

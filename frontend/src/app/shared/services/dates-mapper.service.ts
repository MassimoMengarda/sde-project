import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatesMapperService {
  private baseUrl = 'http://localhost:8080/data/';

  public constructor(private httpSvc: HttpClient) {}

  public getData(
    country: string,
    startDate: string,
    toDate: string
  ): Observable<any> {
    return this.httpSvc.get<any>(
      this.baseUrl + country + '?from=' + startDate + '&to=' + toDate
    );
  }

  public getItalyData(startDate: string, toDate: string): Observable<any> {
    return this.getData('italy', startDate, toDate);
  }

  public getBelgiumData(startDate: string, toDate: string): Observable<any> {
    return this.getData('belgium', startDate, toDate);
  }

  public getUKData(startDate: string, toDate: string): Observable<any> {
    return this.getData('uk', startDate, toDate);
  }
}

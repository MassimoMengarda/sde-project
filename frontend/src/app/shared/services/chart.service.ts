import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private baseUrl = 'http://localhost:8080/chart/';

  public constructor(private httpSvc: HttpClient) {}

  private getChart(
    country: string,
    startDate: string,
    toDate: string
  ): Observable<Blob> {
    return this.httpSvc.get(
      this.baseUrl + country + '?from=' + startDate + '&to=' + toDate, { responseType: 'blob' }
    );
  }

  public getItalyChart(startDate: string, toDate: string): Observable<Blob> {
    return this.getChart('italy', startDate, toDate);
  }

  public getBelgiumChart(startDate: string, toDate: string): Observable<Blob> {
    return this.getChart('belgium', startDate, toDate);
  }

  public getUKChart(startDate: string, toDate: string): Observable<Blob> {
    return this.getChart('uk', startDate, toDate);
  }
}

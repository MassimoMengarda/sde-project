import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Dataset } from 'src/app/shared/models/dataset.model';

@Injectable({
  providedIn: 'root'
})
export class CovidDataService {
  private baseUrl = 'http://localhost:8080/';

  public constructor(private httpSvc: HttpClient) { }

  private getDataset(country: string): Observable<Dataset> {
    return this.httpSvc.get<Dataset>(this.baseUrl + country);
  }

  public getAllDataset(): Observable<Dataset> {
    return this.httpSvc.get<Dataset>(this.baseUrl + 'data');
  }

  public getItalyDataset(): Observable<Dataset> {
    return this.getDataset('italy');
  }

  public getBelgiumDataset(): Observable<Dataset> {
    return this.getDataset('belgium');
  }

  public getUKDataset(): Observable<Dataset> {
    return this.getDataset('uk');
  }

}

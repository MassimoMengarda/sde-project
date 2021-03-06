import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'https://sde-project-unitn.herokuapp.com/data';

  public constructor(private httpSvc: HttpClient) {}

  // Function to updates the DB
  public refreshDB(): Observable<any> {
    return this.httpSvc.get<any>(this.baseUrl);
  }
}

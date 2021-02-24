import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private baseUrl = 'https://sde-project-unitn.herokuapp.com/map/';

  public constructor(private httpSvc: HttpClient) {}

  // Function to gets the map image
  public getMap(country: string, date: string): Observable<Blob> {
    return this.httpSvc.get(this.baseUrl + country + '?date=' + date, {
      responseType: 'blob',
    });
  }
}

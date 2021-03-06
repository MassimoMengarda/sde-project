import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  public isInErrorMode = false;

  public constructor(public router: Router) {}

  // Function to intercept possible network error
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (!req.url.includes('map')) {
          console.error(error);
          this.router.navigateByUrl('/error');
          return throwError(error.message);
        }
      })
    );
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-network-error',
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.scss'],
})
export class NetworkErrorComponent {
  public seconds = 5;

  public constructor(private router: Router) {
    this.countDown();
  }

  // Redirect the user to home page every 5 seconds
  private countDown(): void {
    setInterval(() => {
      this.seconds--;
      if (this.seconds === 0) {
        this.router.navigateByUrl('');
      }
    }, 1000);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isRefreshIconVisibile = true;

  public constructor(private dataSvc: DataService, private router: Router) { }

  public refreshData(): void {
    this.isRefreshIconVisibile = false;
    this.router.navigateByUrl('/refresh');
    this.dataSvc.refreshDB().subscribe(() => {
      this.isRefreshIconVisibile = true;
      this.router.navigateByUrl('/');
    });
  }
}

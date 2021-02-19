import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountrySelectorComponent } from 'src/app/country-selector/country-selector.component';
import { NetworkErrorComponent } from 'src/app/network-error/network-error.component';
import { RefreshComponent } from 'src/app/refresh/refresh.component';

// Define the routes of the project
const routes: Routes = [
  { path: '', component: CountrySelectorComponent },
  { path: 'error', component: NetworkErrorComponent },
  { path: 'refresh', component: RefreshComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

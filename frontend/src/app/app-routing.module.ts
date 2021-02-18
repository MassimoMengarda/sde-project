import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountrySelectorComponent } from 'src/app/country-selector/country-selector.component';
import { NetworkErrorComponent } from 'src/app/network-error/network-error.component';

const routes: Routes = [
  { path: '', component: CountrySelectorComponent },
  { path: 'error', component: NetworkErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

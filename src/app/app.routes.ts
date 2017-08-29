import { Routes } from '@angular/router';

export const ROUTES: Routes = [{
   path: '', redirectTo: 'transit', pathMatch: 'full'
  },

  {
    path: 'transit', loadChildren: './transit/transit.module#TransitModule'
  },

];

import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./customers/customers').then((m) => m.Customers),
  },
  {
    path: 'add',
    loadComponent: () => import('./customer-add/customer-add').then((m) => m.CustomerAdd),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./customer-details/customer-details').then((m) => m.CustomerDetails),
  },
];

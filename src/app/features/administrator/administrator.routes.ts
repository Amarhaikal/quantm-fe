import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const ADMINISTRATOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then((m) => m.Users),
  },
  {
    path: 'users/add',
    loadComponent: () => import('./users/user-add/user-add').then((m) => m.UserAdd),
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/user-details/user-details').then((m) => m.UserDetails),
  },
  {
    path: 'system-codes',
    loadComponent: () => import('./system-codes/system-codes').then((m) => m.SystemCodes),
  },
  {
    path: 'session-activities',
    loadComponent: () =>
      import('./session-activities/session-activities').then((m) => m.SessionActivities),
  },
  {
    path: 'rates',
    loadComponent: () => import('./rates/rates').then((m) => m.Rates),
  },
  {
    path: 'facilities',
    loadComponent: () => import('./facilities/facilities').then((m) => m.Facilities),
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products').then((m) => m.Products),
  },
];

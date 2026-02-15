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
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: 'users/add',
    loadComponent: () => import('./users/add/add').then((m) => m.Add),
    canDeactivate: [pendingChangesGuard],
  },
];

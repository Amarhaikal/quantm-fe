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
];

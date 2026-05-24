import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { menuGuard } from './core/guards/menu.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [menuGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'system-admin',
        loadChildren: () =>
          import('./features/administrator/administrator.routes').then(
            (m) => m.ADMINISTRATOR_ROUTES,
          ),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
      },
      {
        path: 'applications',
        loadChildren: () =>
          import('./features/applications/applications.routes').then(
            (m) => m.APPLICATIONS_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
];

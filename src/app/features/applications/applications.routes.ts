import { Routes } from '@angular/router';
import { ApplicationList } from './application-list/application-list';
import { ApplicationAdd } from './application-add/application-add';
import { ApplicationDetail } from './application-detail/application-detail';

export const APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    component: ApplicationList,
  },
  {
    path: 'add',
    component: ApplicationAdd,
  },
  {
    path: ':id',
    component: ApplicationDetail,
  },
];

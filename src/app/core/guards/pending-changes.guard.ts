import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { HasUnsavedChanges } from '../interfaces/unsaved-changes.interface';
import { ConfirmService } from '../services/confirm.service';
import { of } from 'rxjs';

export const pendingChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  const confirmService = inject(ConfirmService);

  if (component.hasUnsavedChanges()) {
    return confirmService.confirmDiscardChanges();
  }

  return of(true);
};

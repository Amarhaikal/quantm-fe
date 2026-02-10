import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private confirmationService = inject(ConfirmationService);

  confirmSave(callback: () => void) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to save these changes?',
      header: 'Confirm Save',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Confirm',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'Confirm',
        severity: 'primary',
        size: 'small',
      },
      accept: () => {
        callback();
      },
    });
  }

  confirmDelete(callback: () => void) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
        size: 'small',
      },
      accept: () => {
        callback();
      },
    });
  }

  confirm(options: any) {
    this.confirmationService.confirm(options);
  }
}

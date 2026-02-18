import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);
  private translateService = inject(TranslocoService);

  success(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    });
  }

  error(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 4000,
    });
  }

  info(summary: string, detail: string) {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
    });
  }

  warn(summary: string, detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000,
    });
  }

  sessionExpired() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.session_expired'),
      detail: this.translateService.translate('toast.session_expired_detail'),
      life: 4000,
    });
  }

  fetchFailed(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.fetch_failed'),
      detail: this.translateService.translate('toast.fetch_failed_detail', {
        message: err.error.message,
      }),
      life: 4000,
    });
  }

  noChanges() {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.translate('toast.no_changes'),
      detail: this.translateService.translate('toast.no_modifications_detected'),
      life: 3000,
    });
  }

  createSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.translate('toast.create_success'),
      detail: this.translateService.translate('toast.create_success_detail'),
      life: 3000,
    });
  }

  createFailed(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.create_failed'),
      detail: this.translateService.translate('toast.create_failed_detail', {
        message: err.error.message,
      }),
      life: 4000,
    });
  }

  updateSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.translate('toast.update_success'),
      detail: this.translateService.translate('toast.update_success_detail'),
      life: 3000,
    });
  }

  updateFailed(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.update_failed'),
      detail: this.translateService.translate('toast.update_failed_detail', {
        message: err.error.message,
      }),
      life: 4000,
    });
  }

  deleteSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.translate('toast.delete_success'),
      detail: this.translateService.translate('toast.delete_success_detail'),
      life: 3000,
    });
  }

  deleteFailed(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.delete_failed'),
      detail: this.translateService.translate('toast.delete_failed_detail', {
        message: err.error.message,
      }),
      life: 4000,
    });
  }
  invalidForm() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.translate('toast.invalid_form'),
      detail: this.translateService.translate('toast.invalid_form_detail'),
      life: 4000,
    });
  }
}

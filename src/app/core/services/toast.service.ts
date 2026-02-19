import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';

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
    this.translateService
      .selectTranslate(['toast.session_expired', 'toast.session_expired_detail'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'error',
          summary: translations[0],
          detail: translations[1],
          life: 4000,
        });
      });
  }

  fetchFailed(err: any) {
    this.translateService
      .selectTranslate(['toast.fetch_failed', 'toast.fetch_failed_detail'], {
        message: err.error?.message || 'Unknown error',
      })
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'error',
          summary: translations[0],
          detail: translations[1],
          life: 4000,
        });
      });
  }

  noChanges() {
    this.translateService
      .selectTranslate(['toast.no_changes', 'toast.no_modifications_detected'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'info',
          summary: translations[0],
          detail: translations[1],
          life: 3000,
        });
      });
  }

  createSuccess() {
    this.translateService
      .selectTranslate(['toast.create_success', 'toast.create_success_detail'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations[0],
          detail: translations[1],
          life: 3000,
        });
      });
  }

  createFailed(err: any) {
    this.translateService
      .selectTranslate('toast.create_failed')
      .pipe(take(1))
      .subscribe((summary) => {
        this.messageService.add({
          severity: 'error',
          summary,
          detail: this.translateService.translate(`${err.error?.message || 'Unknown error'}`),
          life: 4000,
        });
      });
  }

  updateSuccess() {
    this.translateService
      .selectTranslate(['toast.update_success', 'toast.update_success_detail'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations[0],
          detail: translations[1],
          life: 3000,
        });
      });
  }

  updateFailed(err: any) {
    this.translateService
      .selectTranslate('toast.update_failed')
      .pipe(take(1))
      .subscribe((summary) => {
        this.messageService.add({
          severity: 'error',
          summary,
          detail: this.translateService.translate(`${err.error?.message || 'Unknown error'}`),
          life: 4000,
        });
      });
  }

  deleteSuccess() {
    this.translateService
      .selectTranslate(['toast.delete_success', 'toast.delete_success_detail'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations[0],
          detail: translations[1],
          life: 3000,
        });
      });
  }

  deleteFailed(err: any) {
    this.translateService
      .selectTranslate(['toast.delete_failed', 'toast.delete_failed_detail'], {
        message: err.error?.message || 'Unknown error',
      })
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'error',
          summary: translations[0],
          detail: translations[1],
          life: 4000,
        });
      });
  }

  invalidForm() {
    this.translateService
      .selectTranslate(['toast.invalid_form', 'toast.invalid_form_detail'])
      .pipe(take(1))
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'error',
          summary: translations[0],
          detail: translations[1],
          life: 4000,
        });
      });
  }
}

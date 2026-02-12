import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private confirmationService = inject(ConfirmationService);
  private translocoService = inject(TranslocoService);

  confirmSave(callback: () => void) {
    this.confirmationService.confirm({
      message: this.translocoService.translate('confirm.save.message'),
      header: this.translocoService.translate('confirm.save.header'),
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: this.translocoService.translate('confirm.save.reject'),
      acceptLabel: this.translocoService.translate('confirm.save.accept'),
      rejectButtonProps: {
        label: this.translocoService.translate('confirm.save.reject'),
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: this.translocoService.translate('confirm.save.accept'),
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
      message: this.translocoService.translate('confirm.delete.message'),
      header: this.translocoService.translate('confirm.delete.header'),
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: this.translocoService.translate('confirm.delete.reject'),
      acceptLabel: this.translocoService.translate('confirm.delete.accept'),
      rejectButtonProps: {
        label: this.translocoService.translate('confirm.delete.reject'),
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: this.translocoService.translate('confirm.delete.accept'),
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

  confirmDiscardChanges(): Observable<boolean> {
    const confirmation$ = new Subject<boolean>();

    this.confirmationService.confirm({
      message: this.translocoService.translate('confirm.unsaved_changes.message'),
      header: this.translocoService.translate('confirm.unsaved_changes.header'),
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: this.translocoService.translate('confirm.unsaved_changes.reject'),
      acceptLabel: this.translocoService.translate('confirm.unsaved_changes.accept'),
      rejectButtonProps: {
        label: this.translocoService.translate('confirm.unsaved_changes.reject'),
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: this.translocoService.translate('confirm.unsaved_changes.accept'),
        severity: 'danger',
        size: 'small',
      },
      accept: () => {
        confirmation$.next(true);
        confirmation$.complete();
      },
      reject: () => {
        confirmation$.next(false);
        confirmation$.complete();
      },
    });

    return confirmation$.asObservable();
  }
}

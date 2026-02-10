import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'lib-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ButtonComponent],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  reject(cd: any) {
    if (cd.confirmation?.reject) {
      cd.confirmation.reject();
    }
    cd.hide();
  }

  accept(cd: any) {
    if (cd.confirmation?.accept) {
      cd.confirmation.accept();
    }
    cd.hide();
  }
}

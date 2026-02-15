import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TextboxComponent } from '../textbox/textbox';

export interface AuditData {
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

@Component({
  selector: 'lib-audit-info',
  standalone: true,
  imports: [CommonModule, TextboxComponent],
  templateUrl: './audit-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditInfoComponent {
  private translocoService = inject(TranslocoService);
  data = input<AuditData | null>(null);

  // Guard to ensure translations are loaded before rendering
  protected translationsLoaded = toSignal(this.translocoService.selectTranslation());
}

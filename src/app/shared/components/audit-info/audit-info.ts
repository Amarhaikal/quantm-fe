import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService, TranslocoPipe } from '@ngneat/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TextboxComponent } from '../textbox/textbox';
import { AppearanceService, LabelPosition } from '../../../core/services/appearance.service';

export interface AuditData {
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

@Component({
  selector: 'lib-audit-info',
  standalone: true,
  imports: [CommonModule, TextboxComponent],
  templateUrl: './audit-info.html',
})
export class AuditInfoComponent {
  private translocoService = inject(TranslocoService);
  private appearanceService = inject(AppearanceService);

  data = input<AuditData | null>(null);
  labelPosition = input<LabelPosition | undefined>(undefined);

  /**
   * Effective label position based on explicit property or global appearance setting.
   */
  effectiveLabelPosition = computed(
    () => this.labelPosition() ?? this.appearanceService.labelPosition(),
  );

  // Guard to ensure translations are loaded before rendering
  protected translationsLoaded = toSignal(this.translocoService.selectTranslation());
}

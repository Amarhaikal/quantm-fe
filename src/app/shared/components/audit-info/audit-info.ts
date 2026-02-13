import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
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
  imports: [CommonModule, TranslocoPipe, TextboxComponent],
  templateUrl: './audit-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditInfoComponent {
  data = input<AuditData | null>(null);
}

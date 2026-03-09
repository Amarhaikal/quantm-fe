import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslocoPipe } from '@ngneat/transloco';

import { AuditInfoComponent } from '../../../../shared/components/form/audit-info/audit-info';
import { Customer } from '../../../../core/models/customer.model';
import { TextboxComponent } from '../../../../shared/components/form/textbox/textbox';

@Component({
  selector: 'app-customer-general',
  imports: [AuditInfoComponent, SkeletonModule, TranslocoPipe, TextboxComponent],
  templateUrl: './general.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerGeneral {
  customer = input<Customer | null>(null);
  loading = input<boolean>(false);

  auditData = computed(() => {
    const c = this.customer();
    if (!c) return null;
    return {
      created_by: c.created_by ?? undefined,
      created_at: c.created_at,
      updated_by: c.updated_by ?? undefined,
      updated_at: c.updated_at ?? undefined,
    };
  });
}

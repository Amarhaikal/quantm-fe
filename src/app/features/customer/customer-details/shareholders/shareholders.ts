import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { TableComponent } from '../../../../shared/components/data/table/table';
import { TableColumn } from '../../../../shared/components/data/table/table.model';

@Component({
  selector: 'app-customer-shareholders',
  imports: [TableComponent],
  templateUrl: './shareholders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerShareholders {
  customerId = input<number | null>(null);

  columns: TableColumn[] = [
    { field: 'name', header: 'label.full_name' },
    { field: 'id_no', header: 'label.id_no' },
    { field: 'nationality', header: 'label.nationality' },
    { field: 'share_type', header: 'label.share_type' },
    { field: 'num_shares', header: 'label.num_shares', textAlign: 'right' },
    { field: 'percentage', header: 'label.percentage', textAlign: 'right' },
    { field: 'status', header: 'label.status', type: 'badge', textAlign: 'center' },
  ];
}

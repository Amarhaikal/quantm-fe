import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { TableComponent } from '../../../../shared/components/data/table/table';
import { TableColumn } from '../../../../shared/components/data/table/table.model';

@Component({
  selector: 'app-customer-directors',
  imports: [TableComponent],
  templateUrl: './directors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDirectors {
  customerId = input<number | null>(null);

  columns: TableColumn[] = [
    { field: 'name', header: 'label.full_name' },
    { field: 'id_no', header: 'label.id_no' },
    { field: 'designation', header: 'label.designation' },
    { field: 'nationality', header: 'label.nationality' },
    {
      field: 'appointed_dt',
      header: 'label.appointed_date',
      type: 'date',
      textAlign: 'center',
    },
    { field: 'status', header: 'label.status', type: 'badge', textAlign: 'center' },
  ];
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TableColumn } from './table.model';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonComponent } from '../button/button';

export type ActionType = 'EDIT' | 'DELETE' | 'EDIT_DELETE' | 'NONE';

@Component({
  selector: 'lib-table',
  standalone: true,
  imports: [CommonModule, TableModule, TranslocoPipe, ButtonComponent],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  loading = input<boolean>(false);
  rowHover = input<boolean>(true);
  actionType = input<ActionType>('NONE');
  totalRecords = input<number>(0);
  rows = input<number>(10);
  first = input<number>(0);

  onRowSelect = output<any>();
  onPageChange = output<any>();
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TableColumn } from './table.model';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'lib-table',
  standalone: true,
  imports: [CommonModule, TableModule, TranslocoPipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  loading = input<boolean>(false);
  rowHover = input<boolean>(true);

  onRowSelect = output<any>();
}

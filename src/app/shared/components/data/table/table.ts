import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TableColumn } from './table.model';
import { TranslocoPipe } from '@ngneat/transloco';

import { BadgeComponent } from '../badge/badge';
import { ButtonComponent } from '../../button/button';
import { TextboxComponent } from '../../form/textbox/textbox';
import { DropdownComponent } from '../../form/dropdown/dropdown';
import { FormsModule } from '@angular/forms';

export type ActionType = 'EDIT' | 'DELETE' | 'EDIT_DELETE' | 'DETAILS' | 'DETAILS_DELETE' | 'NONE';

@Component({
  selector: 'lib-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TranslocoPipe,
    BadgeComponent,
    ButtonComponent,
    TextboxComponent,
    DropdownComponent,
    FormsModule,
  ],
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
  onEdit = output<any>();
  onDelete = output<any>();
  onView = output<any>();
  onSave = output<any>();
  onCancel = output<any>();

  private router = inject(Router);

  handleView(rowData: any, event: Event) {
    event.stopPropagation();
    // For now, assuming the user list and generic ID usage
    // The user specifically asked to route to admin/users/:id
    this.router.navigate(['admin/users', rowData.id || rowData.username]);
    this.onView.emit(rowData);
  }

  handleDelete(rowData: any, event: Event) {
    event.stopPropagation();
    this.onDelete.emit(rowData);
  }

  handleEdit(rowData: any, event: Event) {
    event.stopPropagation();
    this.onEdit.emit(rowData);
  }
}

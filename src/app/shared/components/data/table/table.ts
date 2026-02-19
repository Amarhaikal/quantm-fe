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
  onRowsCreate = output<any[]>();
  onRowsUpdate = output<any[]>();
  onRowsDelete = output<any[]>();

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
    // Toggle mark for deletion
    rowData.isMarkedForDeletion = !rowData.isMarkedForDeletion;
    // Collect all currently marked rows
    const allMarked = this.data().filter((r) => r.isMarkedForDeletion);
    this.onRowsDelete.emit(allMarked);
  }

  handleEdit(rowData: any, event: Event) {
    event.stopPropagation();
    this.onEdit.emit(rowData);
  }

  /**
   * For new rows (id === 0): mark as draft (no API call), emit onRowsCreate with current draft list.
   * For existing rows: emit onSave as before.
   */
  handleSave(rowData: any, event: Event) {
    event.stopPropagation();

    // For dropdown columns, store the display label so the row renders correctly
    for (const col of this.columns()) {
      if (col.inputType === 'dropdown' && col.options?.length) {
        const match = col.options.find((o) => o.value === rowData[col.field]);
        if (match) {
          rowData[col.field + '_display'] = match.label;
        }
      }
    }

    if (rowData.id === 0) {
      // Mark as a committed draft — remove editing state
      rowData.isEditing = false;
      rowData.isDraft = true;
      // Collect all current draft rows from the data list
      const allDrafts = this.data().filter((r) => r.isDraft);
      this.onRowsCreate.emit(allDrafts);
    } else {
      // For existing rows: mark as modified (bulk update draft)
      rowData.isEditing = false;
      rowData.isModified = true;
      // Collect all current modified rows from the data list
      const allModified = this.data().filter((r) => r.isModified);
      this.onRowsUpdate.emit(allModified);
    }
  }
}

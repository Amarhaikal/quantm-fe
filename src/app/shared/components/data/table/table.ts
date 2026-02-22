import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TableColumn } from './table.model';
import { TranslocoPipe } from '@ngneat/transloco';

import { BadgeComponent } from '../badge/badge';
import { ButtonComponent } from '../../button/button';
import { TextboxComponent } from '../../form/textbox/textbox';
import { DropdownComponent } from '../../form/dropdown/dropdown';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';

export type ActionType =
  | 'EDIT'
  | 'DELETE'
  | 'DELETES'
  | 'EDIT_DELETE'
  | 'EDIT_DELETES'
  | 'DETAILS'
  | 'DETAILS_DELETE'
  | 'DETAILS_DELETES'
  | 'NONE';

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
    AvatarModule,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @ViewChild('dt') dt!: Table;

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
  onSort = output<any>();
  onEdit = output<any>();
  onDelete = output<any>();
  onView = output<any>();
  onSave = output<any>();
  onCancel = output<any>();
  onRowsCreate = output<any[]>();
  onRowsUpdate = output<any[]>();
  onRowsDelete = output<any[]>();

  // Tracks the currently sorted column and its state (true = asc, false = desc)
  activeSortField: string | null = null;
  activeSortState: boolean | null = null;

  private router = inject(Router);
  private toastService = inject(ToastService);

  handleView(rowData: any, event: Event) {
    event.stopPropagation();
    // For now, assuming the user list and generic ID usage
    // The user specifically asked to route to admin/users/:id
    this.router.navigate(['admin/users', rowData.id || rowData.username]);
    this.onView.emit(rowData);
  }

  handleDelete(rowData: any, event: Event) {
    event.stopPropagation();
    const type = this.actionType();
    const isBulk = type === 'DELETES' || type === 'EDIT_DELETES' || type === 'DETAILS_DELETES';

    if (isBulk) {
      // Toggle mark-for-deletion state (bulk delete flow)
      rowData.isMarkedForDeletion = !rowData.isMarkedForDeletion;
      const allMarked = this.data().filter((r) => r.isMarkedForDeletion);
      this.onRowsDelete.emit(allMarked);
    } else {
      // Single delete — emit to parent to handle with confirm dialog
      this.onDelete.emit(rowData);
    }
  }

  handleEdit(rowData: any, event: Event) {
    event.stopPropagation();
    // Emit first so the parent can transform field values (e.g. "CTRY - Country" → "CTRY")
    this.onEdit.emit(rowData);
    // Snapshot AFTER transformation so the diff is accurate
    rowData._originalValues = {};
    for (const col of this.columns()) {
      if (col.editable) {
        rowData._originalValues[col.field] = rowData[col.field];
      }
    }
  }

  customSort(event: any) {
    if (this.activeSortField !== event.field) {
      // First click on this column: Sort Ascending
      this.activeSortField = event.field;
      this.activeSortState = true;
      this.onSort.emit({ field: event.field, order: 1 });
    } else if (this.activeSortState === true) {
      // Second click on the same column: Sort Descending
      this.activeSortState = false;
      this.onSort.emit({ field: event.field, order: -1 });
    } else {
      // Third click on the same column: Unsort (Remove Sort)
      this.activeSortField = null;
      this.activeSortState = null;

      // Use PrimeNG reset to clear the internal UI sorting states
      if (this.dt) {
        setTimeout(() => {
          this.dt.reset();
        });
      }

      this.onSort.emit({ field: null, order: null });
    }
  }

  /**
   * For new rows (id === 0): mark as draft (no API call), emit onRowsCreate with current draft list.
   * For existing rows: emit onSave as before.
   */
  handleSave(rowData: any, event: Event) {
    event.stopPropagation();

    // Validate row data against column constraints before saving
    if (this.hasRowErrors(rowData)) {
      this.toastService.error('Validation Error', 'Please fix all errors before saving');
      return;
    }

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
      // For existing rows: compute which fields actually changed
      const changedFields: string[] = [];
      if (rowData._originalValues) {
        for (const col of this.columns()) {
          if (col.editable && rowData[col.field] !== rowData._originalValues[col.field]) {
            changedFields.push(col.field);
          }
        }
      }
      rowData._changedFields = changedFields.length > 0 ? changedFields : null;

      // Mark as modified (bulk update draft)
      rowData.isEditing = false;
      rowData.isModified = true;
      // Collect all current modified rows from the data list
      const allModified = this.data().filter((r) => r.isModified);
      this.onRowsUpdate.emit(allModified);
    }
  }

  /**
   * Checks if a row has any validation errors based on column constraints.
   * Returns true if the row has errors and should not be saved.
   */
  private hasRowErrors(rowData: any): boolean {
    for (const col of this.columns()) {
      if (!col.editable) continue;

      const value = rowData[col.field];
      const strValue = value ? String(value) : '';

      // Required check
      if (col.required && !strValue) {
        return true;
      }

      // MinLength check
      if (col.minlength && strValue && strValue.length < col.minlength) {
        return true;
      }

      // MaxLength check
      if (col.maxlength && strValue && strValue.length > col.maxlength) {
        return true;
      }
    }
    return false;
  }
}

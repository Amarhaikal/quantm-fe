import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TableComponent } from '../../../shared/components/data/table/table';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { BaseListDirective } from '../../../core/base/base-list.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeTypeService } from '../../../core/services/code-type.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { SystemCode } from '../../../core/models/code-type.model';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ApiResponse } from '../../../core/models/api.model';
import { debounceTime, distinctUntilChanged, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-system-codes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    PageHeaderComponent,
    PageContainerComponent,
    SearchComponent,
  ],
  templateUrl: './system-codes.html',
  styleUrl: './system-codes.css',
})
export class SystemCodes extends BaseListDirective implements OnInit {
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);

  systemCodes = signal<SystemCode[]>([]);
  draftRows = signal<any[]>([]);
  modifiedRows = signal<any[]>([]);
  deletedRows = signal<any[]>([]);
  hasPendingChanges = computed(
    () =>
      this.draftRows().length > 0 ||
      this.modifiedRows().length > 0 ||
      this.deletedRows().length > 0,
  );

  searchForm = this.fb.group({
    code_type: [''],
    code: [''],
    description: [''],
  });

  codeTypesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.codeTypes().map((ct) => ({
      value: ct.code,
      label: ct.code + ' - ' + ct.description,
    }));
  });

  columns = computed<TableColumn[]>(() => [
    {
      field: 'code_type',
      header: 'label.code_type',
      width: '300px',
      editable: true,
      required: true,
      inputType: 'dropdown',
      options: this.codeTypesOptions(),
    },
    {
      field: 'code',
      header: 'label.code',
      textAlign: 'center',
      width: '180px',
      editable: true,
      required: true,
      inputType: 'text',
    },
    {
      field: 'description',
      header: 'label.description',
      width: '240px',
      editable: true,
      required: true,
      inputType: 'text',
    },
    { field: 'created_by', header: 'label.created_by', width: '180px' },
    {
      field: 'created_at',
      header: 'label.created_at',
      textAlign: 'center',
      type: 'datetime',
      width: '220px',
    },
    { field: 'updated_by', header: 'label.updated_by', width: '180px' },
    {
      field: 'updated_at',
      header: 'label.updated_at',
      textAlign: 'center',
      type: 'datetime',
      width: '220px',
    },
  ]);

  ngOnInit() {
    this.fetchData();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.fetchData(value);
      });
  }

  fetchData(params: any = this.searchForm.value) {
    this.loading.set(true);

    const apiParams = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    this.codeTypeService.getSystemCodesList(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const data = response.data.data.map((item: any) => {
          return {
            ...item,
            code_type: item.code_type.code + ' - ' + item.code_type.description,
          };
        });
        this.systemCodes.set(data);
        this.totalRecords.set(response.data.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.handleError(error, 'Failed to fetch system codes');
      },
    });
  }

  addSystemCode() {
    const defaultCodeType = this.searchForm.get('code_type')?.value || '';

    this.systemCodes.update((data) => [
      {
        id: 0,
        code_type: defaultCodeType,
        code: '',
        description: '',
        created_by: null,
        created_at: '',
        updated_by: null,
        updated_at: null,
        isEditing: true,
      } as any,
      ...data,
    ]);
  }

  /** Called when the user clicks ✔ on an existing saved row (update flow). */
  onSave(rowData: any) {
    if (!rowData.code_type || !rowData.code || !rowData.description) {
      this.toastService.error('Validation Error', 'All fields are required');
      return;
    }

    this.confirmService.confirmSave(() => {
      this.loading.set(true);
      const payload = {
        code_type: rowData.code_type,
        code: rowData.code,
        description: rowData.description,
      };

      this.codeTypeService.updateSystemCode(rowData.id, payload).subscribe({
        next: (response) => {
          if (response.status === 200 || response.status === 201) {
            this.toastService.updateSuccess();
            this.fetchData();
          } else {
            this.toastService.updateFailed(response);
            this.loading.set(false);
          }
        },
        error: (error) => {
          this.toastService.updateFailed(error);
          this.loading.set(false);
        },
      });
    });
  }

  /** Called by lib-table whenever a new row is confirmed as draft (onRowsCreate event). */
  onRowsCreate(drafts: any[]) {
    this.draftRows.set(drafts);
  }

  /** Called by lib-table whenever an existing row is confirmed as modified (onRowsUpdate event). */
  onRowsUpdate(modified: any[]) {
    this.modifiedRows.set(modified);
  }

  /** Called by lib-table whenever a row's deletion mark is toggled (onRowsDelete event). */
  onRowsDelete(marked: any[]) {
    this.deletedRows.set(marked);
  }

  /** Save all draft, modified, and deleted rows to the API in bulk. */
  saveAllPending() {
    const drafts = this.draftRows();
    const modified = this.modifiedRows();
    const deleted = this.deletedRows();

    if (!drafts.length && !modified.length && !deleted.length) return;

    // Validation for create/update rows
    const allPending = [...drafts, ...modified];
    const invalid = allPending.find((r) => !r.code_type || !r.code || !r.description);
    if (invalid) {
      this.toastService.error('Validation Error', 'All fields in pending rows are required');
      return;
    }

    this.confirmService.confirmSave(() => {
      this.loading.set(true);

      const requests: Observable<ApiResponse<any>>[] = [];

      // Bulk create
      if (drafts.length) {
        const creationPayload = drafts.map((r) => ({
          code_type: r.code_type,
          code: r.code,
          description: r.description,
        }));
        requests.push(this.codeTypeService.createSystemCodes(creationPayload));
      }

      // Bulk update
      if (modified.length) {
        const updatePayload = modified.map((r) => ({
          id: r.id,
          code_type: r.code_type,
          code: r.code,
          description: r.description,
        }));
        requests.push(this.codeTypeService.updateSystemCodes(updatePayload));
      }

      // Bulk delete
      if (deleted.length) {
        const deleteIds = deleted.map((r) => r.id);
        requests.push(this.codeTypeService.deleteSystemCodes(deleteIds));
      }

      forkJoin(requests).subscribe({
        next: () => {
          this.toastService.success('Success', 'All changes saved successfully');
          this.draftRows.set([]);
          this.modifiedRows.set([]);
          this.deletedRows.set([]);
          this.fetchData();
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to save some changes');
          console.error(error);
          this.loading.set(false);
        },
      });
    });
  }

  onCancel(rowData: any) {
    if (rowData.id === 0) {
      // Remove the row (editing or draft) from the list
      this.systemCodes.update((data) => data.filter((item) => item !== rowData));
      // Also remove from draftRows if it was saved as a draft
      if (rowData.isDraft) {
        this.draftRows.update((d) => d.filter((item) => item !== rowData));
      }
    } else {
      // Revert editing/modified state and re-fetch to discard changes
      rowData.isEditing = false;
      rowData.isModified = false;
      rowData.isMarkedForDeletion = false;
      this.fetchData();
    }
  }

  onEdit(rowData: any) {
    // If it's an existing row, we might need to extract the code from the formatted "CODE - DESCRIPTION"
    if (rowData.code_type && rowData.code_type.includes(' - ')) {
      rowData.code_type = rowData.code_type.split(' - ')[0];
    }
    rowData.isEditing = true;
  }

  onDelete(rowData: any) {
    // Legacy single-delete handler — kept for backward compatibility
    // Bulk delete is now handled via onRowsDelete + saveAllPending
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.codeTypeService.deleteSystemCode(rowData.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed(response);
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.deleteFailed(error);
            this.loading.set(false);
          },
        });
      },
      { code: rowData.code },
    );
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}

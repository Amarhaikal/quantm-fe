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
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
      width: '280px',
      editable: true,
      inputType: 'dropdown',
      options: this.codeTypesOptions(),
    },
    {
      field: 'code',
      header: 'label.code',
      textAlign: 'center',
      width: '180px',
      editable: true,
      inputType: 'text',
    },
    {
      field: 'description',
      header: 'label.description',
      width: '240px',
      editable: true,
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
    this.systemCodes.update((data) => [
      {
        id: 0,
        code_type: '',
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

      this.codeTypeService.createSystemCode(payload).subscribe({
        next: (response) => {
          if (response.status === 200 || response.status === 201) {
            this.toastService.createSuccess();
            this.fetchData();
          } else {
            console.log('response', response);
            this.toastService.createFailed(response);
            this.loading.set(false);
          }
        },
        error: (error) => {
          console.log('error', error);
          this.toastService.createFailed(error);
          this.loading.set(false);
        },
      });
    });
  }

  onCancel(rowData: any) {
    if (rowData.id === 0) {
      // Remove the new unsaved row
      this.systemCodes.update((data) => data.filter((item) => item !== rowData));
    } else {
      // Revert editing state for existing row (not implemented yet for edit existing)
      rowData.isEditing = false;
    }
  }

  onDelete(rowData: any) {
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
    // this.fetchData();
  }
}

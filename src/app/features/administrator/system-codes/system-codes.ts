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
import { BaseBulkCrudDirective, BulkCrudApi } from '../../../core/base/base-bulk-crud.directive';
import { CodeTypeService } from '../../../core/services/code-type.service';
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
export class SystemCodes extends BaseBulkCrudDirective implements OnInit {
  private codeTypeService = inject(CodeTypeService);

  // ─── Data ─────────────────────────────────────────────────────────────
  systemCodes = signal<SystemCode[]>([]);

  // ─── Bulk CRUD Config ─────────────────────────────────────────────────
  editableFields = ['code_type', 'code', 'description'];

  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) => this.codeTypeService.createSystemCodes(payload),
    bulkUpdate: (payload) => this.codeTypeService.updateSystemCodes(payload),
    bulkDelete: (ids) => this.codeTypeService.deleteSystemCodes(ids),
  };

  // ─── Search ───────────────────────────────────────────────────────────
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

  // ─── Columns ──────────────────────────────────────────────────────────
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

  // ─── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit() {
    this.fetchData();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.fetchData(value);
      });
  }

  // ─── Data Fetching ────────────────────────────────────────────────────
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

  // ─── Add Row ──────────────────────────────────────────────────────────
  addSystemCode() {
    const defaultCodeType = this.searchForm.get('code_type')?.value || '';
    this.addNewRow(this.systemCodes, {
      code_type: defaultCodeType,
      code: '',
      description: '',
      created_by: null,
      created_at: '',
      updated_by: null,
      updated_at: null,
    });
  }

  // ─── Overrides ────────────────────────────────────────────────────────
  /** Override onEdit to parse the formatted "CODE - DESCRIPTION" back to the code value. */
  override onEdit(rowData: any) {
    if (rowData.code_type && rowData.code_type.includes(' - ')) {
      rowData.code_type = rowData.code_type.split(' - ')[0];
    }
    super.onEdit(rowData);
  }

  /** Override onCancel to pass the systemCodes signal. */
  override onCancel(rowData: any) {
    super.onCancel(rowData, this.systemCodes);
  }

  // ─── Search ───────────────────────────────────────────────────────────
  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}

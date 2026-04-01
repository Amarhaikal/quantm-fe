import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
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
import { SystemCodeService } from '../../../core/services/system-code.service';
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
  private systemCodeService = inject(SystemCodeService);

  // ─── Data ─────────────────────────────────────────────────────────────
  systemCodes = signal<SystemCode[]>([]);

  // ─── Bulk CRUD Config ─────────────────────────────────────────────────
  editableFields = ['system_code_type', 'code', 'description'];

  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) =>
      this.systemCodeService.createSystemCodes(payload.map((r) => this.toApiPayload(r))),
    bulkUpdate: (payload) =>
      this.systemCodeService.updateSystemCodes(payload.map((r) => this.toApiPayload(r))),
    bulkDelete: (ids) => this.systemCodeService.deleteSystemCodes(ids),
  };

  // ─── Search ───────────────────────────────────────────────────────────
  searchForm = this.fb.group({
    system_code_type: [''],
    code: ['', [Validators.maxLength(10)]],
    description: ['', [Validators.minLength(3), Validators.maxLength(60)]],
  });

  codeTypesOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.systemCodes().map((ct) => ({
      value: ct.code,
      label: ct.code + ' - ' + ct.description,
    }));
  });

  // ─── Columns ──────────────────────────────────────────────────────────
  columns = computed<TableColumn[]>(() => [
    {
      field: 'system_code_type',
      header: 'label.system_code_type',
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
      maxlength: 10,
    },
    {
      field: 'description',
      header: 'label.description',
      width: '240px',
      editable: true,
      required: true,
      inputType: 'text',
      minlength: 3,
      maxlength: 60,
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

    if (this.sortField()) {
      apiParams.sort_by = this.sortField();
      apiParams.sort_order = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.systemCodeService.getSystemCodesList(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const data = response.result.data.map((item: any) => {
          return {
            ...item,
            system_code_type:
              item.system_code_type.code + ' - ' + item.system_code_type.description,
          };
        });
        this.systemCodes.set(data);
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.toastService.fetchFailed(error);
      },
    });
  }

  // ─── Add Row ──────────────────────────────────────────────────────────
  addSystemCode() {
    const defaultCodeType = this.searchForm.get('system_code_type')?.value || '';
    this.addNewRow(this.systemCodes, {
      system_code_type: defaultCodeType,
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
    if (rowData.system_code_type && rowData.system_code_type.includes(' - ')) {
      rowData.system_code_type = rowData.system_code_type.split(' - ')[0];
    }
    super.onEdit(rowData);
  }

  /** Override onCancel to pass the systemCodes signal. */
  override onCancel(rowData: any) {
    super.onCancel(rowData, this.systemCodes);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────
  /** Transforms the flat payload into the API-expected shape. */
  private toApiPayload(row: Record<string, any>): Record<string, any> {
    const { system_code_type, ...rest } = row;
    const payload: Record<string, any> = { ...rest };
    if (system_code_type !== undefined) {
      payload['system_code_type'] = { code: system_code_type };
    }
    return payload;
  }

  // ─── Search ───────────────────────────────────────────────────────────
  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}

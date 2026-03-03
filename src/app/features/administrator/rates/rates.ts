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
import { RateService } from '../../../core/services/rate.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { Rate } from '../../../core/models/rate.model';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ApiResponse } from '../../../core/models/api.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';

@Component({
  selector: 'app-rates',
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
  templateUrl: './rates.html',
})
export class Rates extends BaseBulkCrudDirective implements OnInit {
  private rateService = inject(RateService);
  private systemCodeService = inject(SystemCodeService);

  // ─── Data ─────────────────────────────────────────────────────────────
  rates = signal<Rate[]>([]);

  // ─── Bulk CRUD Config ─────────────────────────────────────────────────
  editableFields = ['rate_type', 'code', 'description', 'rate'];

  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) =>
      this.rateService.createRates(
        payload.map((p: any) => ({
          ...p,
          rate_type: { code: p.rate_type },
        })) as any,
      ),
    bulkUpdate: (payload) =>
      this.rateService.updateRates(
        payload.map((p: any) => ({
          ...p,
          rate_type: p.rate_type ? { code: p.rate_type } : undefined,
        })),
      ),
    bulkDelete: (ids) => this.rateService.deleteRates(ids),
  };

  // ─── Search ───────────────────────────────────────────────────────────
  searchForm = this.fb.group({
    rate_type: [''],
    code: ['', [Validators.maxLength(10)]],
    description: ['', [Validators.minLength(3), Validators.maxLength(60)]],
    // rate: [''],
  });

  rateTypesOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.RATE_TYPE).map((sc) => ({
      value: sc.code,
      label: sc.description,
    }));
  });

  // ─── Columns ──────────────────────────────────────────────────────────
  columns = computed<TableColumn[]>(() => [
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
    {
      field: 'rate',
      header: 'label.rate',
      textAlign: 'right',
      width: '180px',
      editable: true,
      required: true,
      inputType: 'numeric',
      numericType: 'percentage',
    },
    {
      field: 'rate_type',
      header: 'label.rate_type',
      width: '300px',
      editable: true,
      required: true,
      inputType: 'dropdown',
      options: this.rateTypesOptions(),
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

    const apiParams: any = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (this.sortField()) {
      apiParams.sortBy = this.sortField();
      apiParams.sortOrder = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.rateService.getRates(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const data = response.result.data.map((item: any) => {
          return {
            ...item,
            // Store code in rate_type for the dropdown value
            rate_type: item.rate_type?.code ?? '',
            // Store description in _display for the table cell view
            rate_type_display: item.rate_type?.description ?? '',
          };
        });
        this.rates.set(data);
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.handleError(error, 'Failed to fetch rates');
      },
    });
  }

  // ─── Add Row ──────────────────────────────────────────────────────────
  addRate() {
    this.addNewRow(this.rates, {
      rate_type: '',
      code: '',
      description: '',
      rate: null,
      created_by: null,
      created_at: '',
      updated_by: null,
      updated_at: null,
    });
  }

  // ─── Overrides ────────────────────────────────────────────────────────
  /** Override onEdit to parse the formatted "CODE - DESCRIPTION" back to the code value. */
  override onEdit(rowData: any) {
    super.onEdit(rowData);
  }

  /** Override onCancel to pass the rates signal. */
  override onCancel(rowData: any) {
    super.onCancel(rowData, this.rates);
  }

  // ─── Search ───────────────────────────────────────────────────────────
  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}

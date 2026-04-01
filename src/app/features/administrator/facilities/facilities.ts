import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TableComponent } from '../../../shared/components/data/table/table';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { BaseBulkCrudDirective, BulkCrudApi } from '../../../core/base/base-bulk-crud.directive';
import { FacilityService } from '../../../core/services/facility.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { Facility } from '../../../core/models/facility.model';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ApiResponse } from '../../../core/models/api.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FacilityCreateDto, FacilityUpdateDto } from '../../../core/models/facility.model';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';

@Component({
  selector: 'app-facilities',
  imports: [
    ReactiveFormsModule,
    TextboxComponent,
    ButtonComponent,
    TableComponent,
    PageHeaderComponent,
    PageContainerComponent,
    SearchComponent,
    DropdownComponent,
  ],
  templateUrl: './facilities.html',
})
export class Facilities extends BaseBulkCrudDirective implements OnInit {
  private facilityService = inject(FacilityService);
  private systemCodeService = inject(SystemCodeService);

  editableFields = ['code', 'description', 'asset_type'];

  facilities = signal<Facility[]>([]);

  assetTypesOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.ASSET_TYPE).map((sc) => ({
      value: sc.code,
      label: sc.description,
    }));
  });

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
      field: 'asset_type',
      header: 'label.asset_type',
      width: '300px',
      editable: true,
      required: true,
      inputType: 'dropdown',
      options: this.assetTypesOptions(),
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

  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) => {
      return this.facilityService.createFacilities(
        payload.map((p: any) => ({
          ...p,
          asset_type: { code: p.asset_type },
        })) as FacilityCreateDto[],
      );
    },
    bulkUpdate: (payload) => {
      return this.facilityService.updateFacilities(
        payload.map((p: any) => ({
          ...p,
          asset_type: p.asset_type ? { code: p.asset_type } : undefined,
        })) as FacilityUpdateDto[],
      );
    },
    bulkDelete: (ids) => {
      return this.facilityService.deleteFacilities(ids);
    },
  };

  searchForm = this.fb.group({
    code: [''],
    description: [''],
    asset_type: [''],
  });

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

    const apiParams: any = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (this.sortField()) {
      apiParams.sort_by = this.sortField();
      apiParams.sort_order = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.facilityService.getFacilities(apiParams).subscribe({
      next: (response) => {
        this.facilities.set(
          response.result.data.map((item: any) => {
            return {
              ...item,
              asset_type: item.asset_type?.code ?? '',
              asset_type_display: item.asset_type?.description ?? '',
            };
          }),
        );
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error) => {
        this.handleError(error, 'Failed to fetch facilities');
      },
    });
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }

  addFacility() {
    this.addNewRow(this.facilities, {
      code: '',
      description: '',
      created_by: null,
      created_at: '',
      updated_by: null,
      updated_at: null,
    });
  }

  override onEdit(rowData: any) {
    super.onEdit(rowData);
  }

  override onCancel(rowData: any) {
    super.onCancel(rowData, this.facilities);
  }
}

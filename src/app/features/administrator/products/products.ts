import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseBulkCrudDirective, BulkCrudApi } from '../../../core/base/base-bulk-crud.directive';
import { ApiResponse } from '../../../core/models/api.model';
import { Product, ProductCreateDto, ProductUpdateDto } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { FacilityService } from '../../../core/services/facility.service';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TableComponent } from '../../../shared/components/data/table/table';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/form/dropdown/dropdown';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.html',
})
export class Products extends BaseBulkCrudDirective implements OnInit {
  private productService = inject(ProductService);
  private facilityService = inject(FacilityService);
  private systemCodeService = inject(SystemCodeService);

  editableFields = ['code', 'description', 'facility'];

  products = signal<any[]>([]);
  facilityOptions = signal<OptionDropdown[]>([]);
  assetTypeOptions = computed<OptionDropdown[]>(() => {
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
      width: '300px',
      editable: true,
      required: true,
      inputType: 'text',
      minlength: 3,
      maxlength: 100,
    },
    {
      field: 'facility',
      header: 'label.facility',
      width: '240px',
      editable: true,
      required: true,
      inputType: 'dropdown',
      options: this.facilityOptions(),
    },
    {
      field: 'asset_type_display',
      header: 'label.asset_type',
      width: '200px',
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
      return this.productService.createProducts(
        payload.map((p: any) => ({
          ...p,
          facility: { code: p.facility },
        })) as ProductCreateDto[]
      );
    },
    bulkUpdate: (payload) => {
      return this.productService.updateProducts(
        payload.map((p: any) => ({
          ...p,
          facility: p.facility ? { code: p.facility } : undefined,
        })) as ProductUpdateDto[]
      );
    },
    bulkDelete: (ids) => {
      return this.productService.deleteProducts(ids);
    },
  };

  searchForm = this.fb.group({
    code: [''],
    description: [''],
    facility: [''],
    asset_type: [''],
  });

  ngOnInit() {
    this.fetchFacilities();
    this.fetchData();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.fetchData(value);
      });
  }

  fetchFacilities() {
    // Assuming there's a way to get all facilities for the dropdown
    this.facilityService.getFacilities({ page_no: 1, page_size: 1000 }).subscribe({
      next: (response) => {
        const options = response.result.data.map((f: any) => ({
          value: f.code,
          label: f.description,
        }));
        this.facilityOptions.set(options);
      },
      error: (error) => this.handleError(error, 'Failed to fetch facilities'),
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

    this.productService.getProducts(apiParams).subscribe({
      next: (response) => {
        this.products.set(
          response.result.data.map((item: any) => {
            return {
              ...item,
              facility: item.facility?.code ?? '',
              facility_display: item.facility?.description ?? '',
              asset_type_display: item.facility?.asset_type?.description ?? '',
            };
          })
        );
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error) => {
        this.handleError(error, 'Failed to fetch products');
      },
    });
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }

  addProduct() {
    this.addNewRow(this.products, {
      code: '',
      description: '',
      facility: '',
      created_by: null,
      created_at: '',
      updated_by: null,
      updated_at: null,
    });
  }

  override onCancel(rowData: any) {
    super.onCancel(rowData, this.products);
  }
}

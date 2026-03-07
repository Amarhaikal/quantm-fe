import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseListDirective } from '../../../core/base/base-list.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ApiResponse } from '../../../core/models/api.model';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { TableComponent } from '../../../shared/components/data/table/table';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/form/dropdown/dropdown';

@Component({
  selector: 'app-customers',
  imports: [
    ReactiveFormsModule,
    TableComponent,
    PageHeaderComponent,
    PageContainerComponent,
    SearchComponent,
    ButtonComponent,
    TextboxComponent,
    DropdownComponent,
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Customers extends BaseListDirective implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private systemCodeService = inject(SystemCodeService);
  private confirmService = inject(ConfirmService);

  customers = signal<Customer[]>([]);

  searchForm = this.fb.group({
    fullname: [''],
    reg_no: [''],
    customer_type: [null],
  });

  customerTypeOptions = computed<OptionDropdown[]>(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.CUSTOMER_TYPE).map((c) => ({
      value: c.code,
      label: c.description,
    })),
  );

  columns: TableColumn[] = [
    { field: 'fullname', header: 'label.full_name' },
    { field: 'reg_no', header: 'label.reg_no' },
    { field: 'customer_type', header: 'label.customer_type', type: 'badge', textAlign: 'center' },
    { field: 'created_by', header: 'label.created_by' },
    { field: 'created_at', header: 'label.created_at', type: 'datetime', textAlign: 'center' },
  ];

  ngOnInit() {
    this.fetchData();
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.fetchData(value));
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

    this.customerService.getCustomers(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const mapped = response.result.data.map((item: any) => ({
          ...item,
          customer_type: item.customer_type?.description,
          customer_type_severity: CrudUtils.getStatusSeverity(item.customer_type?.code),
        }));
        this.customers.set(mapped);
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => this.handleError(error, 'Failed to fetch customers'),
    });
  }

  addCustomer() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  onEdit(row: Customer) {
    this.router.navigate([row.id], { relativeTo: this.route });
  }

  handleDelete(row: Customer) {
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.customerService.deleteCustomer(row.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed({ error: { message: response.message } });
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.deleteFailed(error);
            this.loading.set(false);
          },
        });
      },
      { name: row.fullname },
    );
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}

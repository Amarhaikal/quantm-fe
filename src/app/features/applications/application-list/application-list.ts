import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { BaseListDirective } from '../../../core/base/base-list.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan.model';

import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { TableComponent } from '../../../shared/components/data/table/table';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { formatCurrency } from '../../../core/utils/format.utils';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    PageHeaderComponent,
    SearchComponent,
    TableComponent,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList extends BaseListDirective implements OnInit {
  private loanService = inject(LoanService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private systemCodeService = inject(SystemCodeService);
  private productService = inject(ProductService);

  loans = signal<Loan[]>([]);
  products = signal<Product[]>([]);

  searchForm = this.fb.group({
    loan_number: [''],
    customer_name: [''],
    product_code: [''],
    loan_status: [''],
  });

  statusOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.LOAN_STATUS).map((sts) => ({
      value: sts.code,
      label: sts.description,
    }));
  });

  productsOptions = computed<OptionDropdown[]>(() => {
    return this.products().map((prd) => ({
      value: prd.code,
      label: prd.description,
    }));
  });

  columns: TableColumn[] = [
    { field: 'loan_number', header: 'label.loan_number' },
    { field: 'customer', header: 'label.customer' },
    { field: 'product', header: 'label.product' },
    { field: 'principal_amount', header: 'label.principal_amount' },
    { field: 'loan_status', header: 'label.loan_status', type: 'badge' },
    // { field: 'created_at', header: 'label.created_at', type: 'datetime' },
  ];

  ngOnInit() {
    this.fetchData();
    this.fetchProducts();
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.fetchData(value));
  }

  fetchProducts() {
    this.productService.getProducts({ page_no: 1, page_size: 50 }).subscribe({
      next: (response) => {
        if (response.result?.data) {
          this.products.set(response.result.data);
        }
      },
      error: (error: unknown) => this.handleError(error, 'Failed to fetch products'),
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

    this.loanService.getLoans(apiParams).subscribe({
      next: (response) => {
        if (response.result?.data) {
          const mappedData = this.refactoredLoans(response.result?.data);
          this.loans.set(mappedData);
          this.totalRecords.set(response.result.total_count);
        } else {
          this.loans.set([]);
          this.totalRecords.set(0);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => this.handleError(error, 'Failed to fetch loans'),
    });
  }

  refactoredLoans(data: any[]): any[] {
    return data.map((item) => {
      return {
        ...item,
        customer: item.customer?.fullname,
        loan_status: item.loan_status?.description,
        product: item.product?.description,
        principal_amount: formatCurrency(item.principal_amount),
      };
    });
  }

  addApplication() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  onView(row: Loan) {
    this.router.navigate([row.id], { relativeTo: this.route });
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
    this.fetchData();
  }
}

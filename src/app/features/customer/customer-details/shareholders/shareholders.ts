import { Component, ChangeDetectionStrategy, input, inject, OnInit, signal } from '@angular/core';

import { TableComponent } from '../../../../shared/components/data/table/table';
import { TableColumn } from '../../../../shared/components/data/table/table.model';
import { CustomerService } from '../../../../core/services/customer.service';
import { formatCurrency, formatPercentage } from '../../../../core/utils/format.utils';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ShareholderFormComponent } from './shareholder-form/shareholder-form';

@Component({
  selector: 'app-customer-shareholders',
  imports: [TableComponent, DialogModule, TranslocoPipe, ButtonComponent, ShareholderFormComponent],
  templateUrl: './shareholders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerShareholders implements OnInit {
  customerId = input<number | null>(null);

  private customerService = inject(CustomerService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  shareholders = signal<any[]>([]);
  pageNo = signal<number>(1);
  pageSize = signal<number>(10);
  sortField = signal<string | null>(null);
  sortOrder = signal<number>(1);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(true);

  displayForm = signal<boolean>(false);
  selectedShareholder = signal<any>(null);

  columns: TableColumn[] = [
    { field: 'fullname', header: 'label.full_name' },
    { field: 'reg_no', header: 'label.reg_no' },
    { field: 'nationality', header: 'label.nationality' },
    { field: 'share_amount_formatted', header: 'label.num_shares', textAlign: 'right' },
    // { field: 'share_percentage', header: 'label.percentage_shares', textAlign: 'right' },
  ];

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    const apiParams: any = {
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (this.sortField()) {
      apiParams.sort_by = this.sortField();
      apiParams.sort_order = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.customerService.getCustomerShareholders(this.customerId()!, apiParams).subscribe((res) => {
      const data = res.result.data.map((item: any) => {
        return {
          ...item,
          nationality: item.country.description,
          share_amount_formatted: formatCurrency(item.share_amount),
          // share_percentage: formatPercentage(item.share_percentage),
        };
      });
      this.shareholders.set(data);
      this.totalRecords.set(res.result.total_count);
      this.loading.set(false);
    });
  }

  handlePageChange(event: any) {
    this.pageNo.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.fetchData();
  }

  handleSort(event: any) {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    this.fetchData();
  }

  onAdd() {
    this.selectedShareholder.set(null);
    this.displayForm.set(true);
  }

  onDetails(item: any) {
    this.selectedShareholder.set(item);
    this.displayForm.set(true);
  }

  hideForm() {
    this.displayForm.set(false);
    this.selectedShareholder.set(null);
  }

  onSaved() {
    this.hideForm();
    this.fetchData();
  }

  onDelete(item: any) {
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.customerService.deleteCustomerShareholder(this.customerId()!, item.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed({
                error: { message: response.message || 'Failed to delete shareholder' },
              });
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.deleteFailed(error);
            this.loading.set(false);
          },
        });
      },
      { name: item.fullname },
    );
  }
}

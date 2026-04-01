import { Component, ChangeDetectionStrategy, input, inject, OnInit, signal } from '@angular/core';

import { TableComponent } from '../../../../shared/components/data/table/table';
import { TableColumn } from '../../../../shared/components/data/table/table.model';
import { CustomerService } from '../../../../core/services/customer.service';
import { formatCurrency } from '../../../../core/utils/format.utils';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { DateService } from '../../../../core/services/date.service';
import { DialogModule } from 'primeng/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ShareholderFormComponent } from './shareholder-form/shareholder-form';
import { BaseListDirective } from '../../../../core/base/base-list.directive';

@Component({
  selector: 'app-customer-shareholders',
  imports: [TableComponent, DialogModule, TranslocoPipe, ButtonComponent, ShareholderFormComponent],
  templateUrl: './shareholders.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerShareholders extends BaseListDirective implements OnInit {
  customerId = input<number | null>(null);

  private customerService = inject(CustomerService);
  private confirmService = inject(ConfirmService);
  private dateService = inject(DateService);

  shareholders = signal<any[]>([]);

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
          created_at: this.dateService.formatAuditDate(item.created_at),
          updated_at: this.dateService.formatAuditDate(item.updated_at),
          // share_percentage: formatPercentage(item.share_percentage),
        };
      });
      this.shareholders.set(data);
      this.totalRecords.set(res.result.total_count);
      this.loading.set(false);
    });
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

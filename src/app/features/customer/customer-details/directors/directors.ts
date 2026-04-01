import { Component, ChangeDetectionStrategy, input, inject, OnInit, signal } from '@angular/core';

import { TableComponent } from '../../../../shared/components/data/table/table';
import { TableColumn } from '../../../../shared/components/data/table/table.model';
import { BaseListDirective } from '../../../../core/base/base-list.directive';
import { CustomerService } from '../../../../core/services/customer.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Dialog } from 'primeng/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { DirectorForm } from './directors-form/directors-form';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { DateService } from '../../../../core/services/date.service';

@Component({
  selector: 'app-customer-directors',
  imports: [TableComponent, ButtonComponent, Dialog, TranslocoPipe, DirectorForm],
  templateUrl: './directors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDirectors extends BaseListDirective implements OnInit {
  customerId = input<number | null>(null);

  private customerService = inject(CustomerService);
  private confirmService = inject(ConfirmService);
  private dateService = inject(DateService);

  directors = signal<any[]>([]);

  displayForm = signal<boolean>(false);
  selectedDirector = signal<any>(null);

  columns: TableColumn[] = [
    { field: 'fullname', header: 'label.full_name' },
    { field: 'id_no', header: 'label.id_no' },
    { field: 'email', header: 'label.email' },
    { field: 'phone_no', header: 'label.phone_no' },
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

    this.customerService.getCustomerDirectors(this.customerId()!, apiParams).subscribe((res) => {
      const data = res.result.data.map((item: any) => {
        return {
          ...item,
          created_at: this.dateService.formatAuditDate(item.created_at),
          updated_at: this.dateService.formatAuditDate(item.updated_at),
        };
      });
      this.directors.set(data);
      this.totalRecords.set(res.result.total_count);
      this.loading.set(false);
    });
  }

  onAdd() {
    this.selectedDirector.set(null);
    this.displayForm.set(true);
  }

  onDetails(item: any) {
    this.selectedDirector.set(item);
    this.displayForm.set(true);
  }

  hideForm() {
    this.displayForm.set(false);
    this.selectedDirector.set(null);
  }

  onSaved() {
    this.hideForm();
    this.fetchData();
  }

  onDelete(item: any) {
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.customerService.deleteCustomerDirector(this.customerId()!, item.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed({
                error: { message: response.message || 'Failed to delete directors' },
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

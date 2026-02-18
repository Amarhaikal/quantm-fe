import { Directive, signal, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastService } from '../services/toast.service';

@Directive()
export abstract class BaseListDirective {
  protected fb = inject(FormBuilder);
  protected toastService = inject(ToastService);

  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  pageNo = signal<number>(1);
  pageSize = signal<number>(10);

  abstract fetchData(params?: any): void;

  handlePageChange(event: any) {
    this.pageNo.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.fetchData();
  }

  handleError(error: any, message: string = 'Failed to fetch data') {
    console.error(message, error);
    this.loading.set(false);
    this.toastService.error('Error', message);
  }
}

import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';

import { LoanService } from '../../../core/services/loan.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { RateService } from '../../../core/services/rate.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { Loan } from '../../../core/models/loan.model';
import { ToastService } from '../../../core/services/toast.service';
import { CrudUtils } from '../../../core/utils/crud.utils';

import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { NumericComponent } from '../../../shared/components/form/numeric/numeric';
import { DatePickerComponent } from '../../../shared/components/form/datepicker/datepicker';
import { ButtonComponent } from '../../../shared/components/button/button';
import { BadgeComponent } from '../../../shared/components/data/badge/badge';
import { DateService } from '../../../core/services/date.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-application-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoPipe,
    PageContainerComponent,
    PageHeaderComponent,
    DropdownComponent,
    NumericComponent,
    DatePickerComponent,
    ButtonComponent,
    BadgeComponent,
    SkeletonModule,
  ],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetail implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loanService = inject(LoanService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private rateService = inject(RateService);
  private systemCodeService = inject(SystemCodeService);
  private toastService = inject(ToastService);
  protected dateService = inject(DateService);

  form: FormGroup;
  loan = signal<Loan | null>(null);
  loading = signal(true);
  submitting = signal(false);

  isPending = computed(() => this.loan()?.loan_status?.code === 'PND');

  customersList = signal<any[]>([]);
  customerOptions = signal<OptionDropdown[]>([]);
  productOptions = signal<OptionDropdown[]>([]);
  rateOptions = signal<OptionDropdown[]>([]);

  loadingCustomers = signal(false);
  loadingProducts = signal(false);
  loadingRates = signal(false);

  frequencyOptions = computed(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.FREQUENCY).map((c) => ({
      value: c.code,
      label: c.description,
    })),
  );

  statusOptions = computed(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.LOAN_STATUS).map((c) => ({
      value: c.code,
      label: c.description,
    })),
  );

  constructor() {
    this.form = this.fb.group({
      customer_id: [null, Validators.required],
      product_code: ['', Validators.required],
      rate_code: ['', Validators.required],
      principal_amount: [null, [Validators.required, Validators.min(0)]],
      tenure: [null, [Validators.required, Validators.min(1)]],
      frequency_code: ['', Validators.required],
      start_date: [null, Validators.required],
      end_date: [{ value: null, disabled: true }],
      loan_status_code: [{ value: null, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadLookups();
    this.setupEndDateCalculation();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchLoan(Number(id));
    }
  }

  setupEndDateCalculation() {
    this.form.valueChanges.subscribe(() => {
      const tenure = this.form.get('tenure')?.value;
      const freq = this.form.get('frequency_code')?.value;
      const startDateVal = this.form.get('start_date')?.value;

      if (tenure && freq && startDateVal) {
        const startDate = new Date(startDateVal);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + Number(tenure));

          const year = endDate.getFullYear();
          const month = String(endDate.getMonth() + 1).padStart(2, '0');
          const day = String(endDate.getDate()).padStart(2, '0');
          const formatted = `${year}-${month}-${day}`;

          if (this.form.get('end_date')?.value !== formatted) {
            this.form.get('end_date')?.setValue(formatted, { emitEvent: false });
          }
        }
      } else {
        if (this.form.get('end_date')?.value !== null) {
          this.form.get('end_date')?.setValue(null, { emitEvent: false });
        }
      }
    });
  }

  loadLookups() {
    this.loadingCustomers.set(true);
    this.customerService.getCustomers({ page_no: 1, page_size: 100 }).subscribe({
      next: (res) => {
        if (res.result?.data) {
          const list = res.result.data;
          this.customersList.set(list);
          this.customerOptions.set(
            list.map((c: any) => ({ value: c.id.toString(), label: c.fullname })),
          );
          this.patchCustomerFromLoan();
        }
        this.loadingCustomers.set(false);
      },
      error: () => this.loadingCustomers.set(false),
    });

    this.loadingProducts.set(true);
    this.productService.getProducts({ page_no: 1, page_size: 100 }).subscribe({
      next: (res) => {
        if (res.result?.data) {
          this.productOptions.set(
            res.result.data.map((p: any) => ({ value: p.code, label: p.description })),
          );
        }
        this.loadingProducts.set(false);
      },
      error: () => this.loadingProducts.set(false),
    });

    this.loadingRates.set(true);
    this.rateService.getRates({ page_no: 1, page_size: 100 }).subscribe({
      next: (res) => {
        if (res.result?.data) {
          this.rateOptions.set(
            res.result.data.map((r: any) => ({
              value: r.code,
              label: `${r.description} (${r.rate}%)`,
            })),
          );
        }
        this.loadingRates.set(false);
      },
      error: () => this.loadingRates.set(false),
    });
  }

  patchCustomerFromLoan() {
    const loan = this.loan();
    if (!loan || !loan.customer) return;

    // Find customer in customerList by customer_no, fullname, or reg_no
    const matchedCustomer = this.customersList().find(
      (c) =>
        (c.customer_no && c.customer_no === loan.customer.customer_no) ||
        (c.fullname && c.fullname === loan.customer.fullname) ||
        (c.reg_no && c.reg_no === loan.customer.reg_no),
    );

    if (matchedCustomer) {
      this.form.patchValue({
        customer_id: matchedCustomer.id.toString(),
      });
    }
  }

  fetchLoan(id: number) {
    this.loading.set(true);
    this.loanService.getLoanById(id).subscribe({
      next: (res) => {
        const loan = res.result;
        this.loan.set(loan);
        if (loan) {
          this.form.patchValue({
            product_code: loan.product?.code,
            rate_code: loan.rate?.code,
            principal_amount: loan.principal_amount,
            tenure: loan.tenure,
            frequency_code: loan.frequency?.code,
            start_date: loan.start_date,
            end_date: loan.end_date,
            loan_status_code: loan.loan_status?.code,
          });

          this.patchCustomerFromLoan();

          const isPending = loan.loan_status?.code === 'PND';
          if (!loan.can_edit || isPending) {
            this.form.disable();
          } else {
            this.form.enable();
            this.form.get('end_date')?.disable();
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load application details');
        this.loading.set(false);
        this.router.navigate(['..'], { relativeTo: this.route });
      },
    });
  }

  onSubmit(type: 'DRAFT' | 'SUBMIT') {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const val = this.form.getRawValue();
    const payload = {
      customer_id: Number(val.customer_id),
      product: { code: val.product_code },
      rate: { code: val.rate_code },
      principal_amount: val.principal_amount,
      tenure: val.tenure,
      frequency: { code: val.frequency_code },
      start_date: val.start_date,
      end_date: val.end_date,
      loan_status: { code: val.loan_status_code },
    };

    const id = this.loan()?.id;
    if (id) {
      this.loanService.updateLoan(id, payload).subscribe({
        next: () => {
          this.toastService.success('Success', 'Application updated successfully');
          this.fetchLoan(id);
        },
        error: () => {
          this.submitting.set(false);
          this.toastService.error('Error', 'Failed to update application');
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  getStatusSeverity(code: string) {
    return CrudUtils.getStatusSeverity(code);
  }
}

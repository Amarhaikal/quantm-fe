import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';

import { LoanService } from '../../../core/services/loan.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { RateService } from '../../../core/services/rate.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { ToastService } from '../../../core/services/toast.service';

import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/form/dropdown/dropdown';
import { NumericComponent } from '../../../shared/components/form/numeric/numeric';
import { DatePickerComponent } from '../../../shared/components/form/datepicker/datepicker';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-application-add',
  standalone: true,
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
  ],
  templateUrl: './application-add.html',
  styleUrl: './application-add.css',
})
export class ApplicationAdd implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loanService = inject(LoanService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private rateService = inject(RateService);
  private systemCodeService = inject(SystemCodeService);
  private toastService = inject(ToastService);

  form: FormGroup;
  submitting = signal(false);

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
      loan_status_code: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadLookups();
    this.setupEndDateCalculation();
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
          this.customerOptions.set(
            res.result.data.map((c: any) => ({ value: c.id.toString(), label: c.fullname })),
          );
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
            res.result.data.map((r: any) => ({ value: r.code, label: `${r.description} (${r.rate}%)` })),
          );
        }
        this.loadingRates.set(false);
      },
      error: () => this.loadingRates.set(false),
    });
  }

  onSubmit() {
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

    this.loanService.createLoan(payload).subscribe({
      next: () => {
        this.toastService.success('Success', 'Application created successfully');
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastService.error('Error', 'Failed to create application');
      },
    });
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}

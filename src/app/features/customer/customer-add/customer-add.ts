import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { TextboxComponent, TextboxType } from '../../../shared/components/form/textbox/textbox';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/form/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';
import { CustomerService } from '../../../core/services/customer.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { BaseFormComponent } from '../../../core/base/base-form.component';
import { CustomValidators } from '../../../core/utils/validators';

@Component({
  selector: 'app-customer-add',
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    PageContainerComponent,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './customer-add.html',
  styleUrl: './customer-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAdd extends BaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private systemCodeService = inject(SystemCodeService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(false);
  selectedCustomerType = signal<string | null>(null);

  customerTypeOptions = computed<OptionDropdown[]>(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.CUSTOMER_TYPE).map((c) => ({
      value: c.code,
      label: c.description,
    })),
  );

  isIndividual = computed(() => this.selectedCustomerType() === 'IND');
  regNoType = computed<TextboxType>(() => (this.isIndividual() ? 'IDNO' : 'REGNO'));

  form = this.fb.group({
    customer_type_code: [null as string | null, [Validators.required]],
    fullname: ['', [Validators.required, Validators.maxLength(100)]],
    reg_no: [{ value: '', disabled: true }, [Validators.required]],
  });

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  ngOnInit() {
    this.form.controls.customer_type_code.valueChanges.subscribe((code) => {
      this.selectedCustomerType.set(code);
      const regNo = this.form.controls.reg_no;
      regNo.reset('');

      if (!code) {
        regNo.disable();
        return;
      }

      regNo.enable();
      if (code === 'IND') {
        regNo.setValidators([Validators.required, CustomValidators.idNoValidator()]);
      } else {
        regNo.setValidators([Validators.required, this.companyRegNoValidator()]);
      }
      regNo.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  private companyRegNoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Mask emits digits only; must be exactly 12
      if (value.length !== 12) return { invalidCompanyRegNo: true };

      // First 4 digits must be a valid year (YYYY)
      const year = parseInt(value.substring(0, 4), 10);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) return { invalidCompanyRegNo: true };

      return null;
    };
  }

  goBack() {
    this.router.navigate(['/customers']);
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAllAsTouched();
        control.updateValueAndValidity({ emitEvent: true });
      });
      this.toastService.invalidForm();
      this.cdr.detectChanges();
      return;
    }

    const { fullname, reg_no, customer_type_code } = this.form.getRawValue();
    const payload = {
      fullname: fullname!,
      reg_no: reg_no!,
      customer_type: { code: customer_type_code! },
    };

    this.confirmService.confirmSave(() => {
      this.loading.set(true);
      this.customerService.createCustomer(payload).subscribe({
        next: (response) => {
          if (response.status === 200 || response.status === 201) {
            this.toastService.success('Success', 'Customer created successfully');
            this.form.markAsPristine();
            this.router.navigate(['/customers', response.result.id], { replaceUrl: true });
          } else {
            this.toastService.error('Error', response.message || 'Failed to create customer');
            this.loading.set(false);
          }
        },
        error: (error) => {
          this.toastService.error('Error', error?.error?.message || 'Failed to create customer');
          this.loading.set(false);
        },
      });
    });
  }
}

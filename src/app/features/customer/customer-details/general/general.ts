import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject,
  effect,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollTopModule } from 'primeng/scrolltop';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { AuditInfoComponent } from '../../../../shared/components/form/audit-info/audit-info';
import { Customer } from '../../../../core/models/customer.model';
import { TextboxComponent } from '../../../../shared/components/form/textbox/textbox';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../../shared/components/form/dropdown/dropdown';
import { DatePickerComponent } from '../../../../shared/components/form/datepicker/datepicker';
import { NumericComponent } from '../../../../shared/components/form/numeric/numeric';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { CustomerService } from '../../../../core/services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SystemCodeService } from '../../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../../core/constants/code-types.constants';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { DateService } from '../../../../core/services/date.service';

@Component({
  selector: 'app-customer-general',
  imports: [
    AuditInfoComponent,
    SkeletonModule,
    ScrollTopModule,
    TextboxComponent,
    DropdownComponent,
    DatePickerComponent,
    NumericComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './general.html',
  styleUrl: './general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class CustomerGeneral {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private systemCodeService = inject(SystemCodeService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private dateService = inject(DateService);

  customer = input<Customer | null>(null);
  loading = input<boolean>(false);
  saving = signal(false);
  originalData: any = null;

  private REFERENCE_FIELDS = ['company_type', 'department'];

  form: FormGroup;
  showScrollDown = signal<boolean>(true);

  companyTypeOptions = computed<OptionDropdown[]>(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.COMPANY_TYPE).map((code) => ({
      value: code.code,
      label: code.description,
    })),
  );

  departmentOptions = computed<OptionDropdown[]>(() =>
    this.systemCodeService.getSystemCodes(CODE_TYPES.COMPANY_DEPARTMENT).map((code) => ({
      value: code.code,
      label: code.description,
    })),
  );

  isCompany = computed(() => this.customer()?.customer_type?.code === 'CMP');

  constructor() {
    this.form = this.fb.group({
      fullname: this.fb.nonNullable.control('', [Validators.required]),
      reg_no: [''], // Enabled as per previous requirement
      customer_no: [''], // Enabled as per previous requirement
      customer_type: [{ value: '', disabled: true }],
      email: ['', [Validators.email]],
      phone_no: [''],
      company_type: [null as string | null],
      department: [null as string | null],
      start_operation_date: [null as string | null],
      no_of_employees: [null as number | null],
      last_revenue_reported: [null as number | null],
      created_by: [{ value: '', disabled: true }],
      created_at: [{ value: '', disabled: true }],
      updated_by: [{ value: '', disabled: true }],
      updated_at: [{ value: '', disabled: true }],
    });

    effect(() => {
      const c = this.customer();
      if (c) {
        this.form.patchValue({
          fullname: c.fullname,
          reg_no: c.reg_no,
          customer_no: c.customer_no,
          customer_type: c.customer_type?.description,
          email: c.email,
          phone_no: c.phone_no,
          company_type: c.company_type?.code,
          department: c.department?.code,
          start_operation_date: c.start_operation_date,
          no_of_employees: c.no_of_employees,
          last_revenue_reported: c.last_revenue_reported,
          created_by: c.created_by,
          created_at: this.dateService.formatAuditDate(c.created_at),
          updated_by: c.updated_by,
          updated_at: this.dateService.formatAuditDate(c.updated_at),
        });
        this.originalData = this.form.getRawValue();
      }
    });
  }

  onSave() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAllAsTouched();
        control.updateValueAndValidity({ emitEvent: true });
      });
      this.toastService.invalidForm();
      this.cdr.detectChanges();
      return;
    }

    const currentValues = this.form.getRawValue();
    const updateData: any = {};

    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key] !== this.originalData[key]) {
        if (this.REFERENCE_FIELDS.includes(key)) {
          updateData[key] = currentValues[key] ? { code: currentValues[key] } : null;
        } else if (
          [
            'fullname',
            'email',
            'phone_no',
            'reg_no',
            'customer_no',
            'start_operation_date',
            'no_of_employees',
            'last_revenue_reported',
          ].includes(key)
        ) {
          updateData[key] = currentValues[key];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      this.toastService.noChanges();
      return;
    }

    this.confirmService.confirmSave(() => {
      this.saving.set(true);
      this.customerService.updateCustomer(this.customer()!.id, updateData).subscribe({
        next: (response) => {
          this.toastService.updateSuccess();
          this.saving.set(false);

          if (response.result) {
            const c = response.result;
            this.form.patchValue({
              fullname: c.fullname,
              reg_no: c.reg_no,
              customer_no: c.customer_no,
              customer_type: c.customer_type?.description,
              email: c.email,
              phone_no: c.phone_no,
              company_type: c.company_type?.code,
              department: c.department?.code,
              start_operation_date: c.start_operation_date,
              no_of_employees: c.no_of_employees,
              last_revenue_reported: c.last_revenue_reported,
              created_by: c.created_by,
              created_at: this.dateService.formatAuditDate(c.created_at),
              updated_by: c.updated_by,
              updated_at: this.dateService.formatAuditDate(c.updated_at),
            });
            this.originalData = this.form.getRawValue();
          }

          this.form.markAsPristine();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.updateFailed(error);
          this.saving.set(false);
          this.cdr.detectChanges();
        },
      });
    });
  }

  onWindowScroll() {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollDown.set(scrollPosition < 200);
  }

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}

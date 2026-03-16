import { Component, ChangeDetectionStrategy, input, output, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';

import { TextboxComponent } from '../../../../../shared/components/form/textbox/textbox';
import { NumericComponent } from '../../../../../shared/components/form/numeric/numeric';
import { DropdownComponent, OptionDropdown } from '../../../../../shared/components/form/dropdown/dropdown';
import { ButtonComponent } from '../../../../../shared/components/button/button';
import { AuditInfoComponent } from '../../../../../shared/components/form/audit-info/audit-info';

import { CustomerService } from '../../../../../core/services/customer.service';
import { SystemCodeService } from '../../../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../../../core/constants/code-types.constants';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-shareholder-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextboxComponent,
    NumericComponent,
    DropdownComponent,
    ButtonComponent,
    AuditInfoComponent
  ],
  templateUrl: './shareholder-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareholderFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private customerService = inject(CustomerService);
  private systemCodeService = inject(SystemCodeService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  customerId = input.required<number>();
  data = input<any>(null); // Passed in edit mode

  saved = output<void>();
  cancelled = output<void>();

  isSaving = signal<boolean>(false);

  form = this.fb.group({
    fullname: ['', [Validators.required]],
    reg_no: [''],
    nationality: [null as string | null, [Validators.required]],
    share_amount: ['', [Validators.required, Validators.min(0)]],
    // share_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    status: [null as string | null],
  });

  countryOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.COUNTRY).map((code) => ({
      value: code.code,
      label: code.description,
    }));
  });

  ngOnInit() {
    const editData = this.data();
    if (editData) {
      this.form.patchValue({
        fullname: editData.fullname,
        reg_no: editData.reg_no,
        nationality: editData.country?.code || editData.nationality?.code,
        share_amount: editData.share_amount,
        // share_percentage: editData.share_percentage,
        status: editData.status?.code || editData.status
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.toastService.invalidForm();
      this.form.markAllAsTouched();
      return;
    }

    this.confirmService.confirmSave(() => {
      this.isSaving.set(true);
      const payload = this.form.getRawValue();

      // Map the payload to expected DTO format
      const transformedPayload = {
        ...payload,
        country: payload.nationality ? { code: payload.nationality } : undefined,
        status: payload.status ? { code: payload.status } : undefined,
        share_amount: Number(payload.share_amount),
        // share_percentage: Number(payload.share_percentage)
      };
      // remove the old flattened keys
      delete (transformedPayload as any).nationality;

      const editData = this.data();
      const isEdit = editData && editData.id;
      const action$ = isEdit
        ? this.customerService.updateCustomerShareholder(this.customerId(), editData.id, transformedPayload)
        : this.customerService.createCustomerShareholder(this.customerId(), transformedPayload);

      action$.subscribe({
        next: (res) => {
          if (res.status === 200 || res.status === 201) {
            if (isEdit) this.toastService.updateSuccess();
            else this.toastService.createSuccess();
            this.saved.emit();
          } else {
            if (isEdit) this.toastService.updateFailed({ error: { message: res.message } });
            else this.toastService.createFailed({ error: { message: res.message } });
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          if (isEdit) this.toastService.updateFailed(err);
          else this.toastService.createFailed(err);
          this.isSaving.set(false);
        }
      });
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}

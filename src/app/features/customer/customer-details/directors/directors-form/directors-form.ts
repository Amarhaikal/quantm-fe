import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TextboxComponent } from '../../../../../shared/components/form/textbox/textbox';
import { AuditInfoComponent } from '../../../../../shared/components/form/audit-info/audit-info';
import { ButtonComponent } from '../../../../../shared/components/button/button';

import { CustomerService } from '../../../../../core/services/customer.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-director-form',
  standalone: true,
  imports: [ReactiveFormsModule, TextboxComponent, AuditInfoComponent, ButtonComponent],
  templateUrl: './directors-form.html',
  styleUrl: './directors-form.css',
})
export class DirectorForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  customerId = input.required<number>();
  data = input<any>(null); // Passed in edit mode

  saved = output<void>();
  cancelled = output<void>();

  isSaving = signal<boolean>(false);

  form = this.fb.group({
    fullname: ['', [Validators.required]],
    id_no: [''],
    email: [null as string | null, [Validators.required, Validators.email]],
    phone_no: [
      '',
      [Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(15)],
    ],
  });

  ngOnInit() {
    const editData = this.data();
    if (editData) {
      this.form.patchValue({
        fullname: editData.fullname,
        id_no: editData.id_no,
        email: editData.email,
        phone_no: editData.phone_no,
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
      };

      const editData = this.data();
      const isEdit = editData && editData.id;
      const action$ = isEdit
        ? this.customerService.updateCustomerDirector(
            this.customerId(),
            editData.id,
            transformedPayload,
          )
        : this.customerService.createCustomerDirector(this.customerId(), transformedPayload);

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
        },
      });
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}

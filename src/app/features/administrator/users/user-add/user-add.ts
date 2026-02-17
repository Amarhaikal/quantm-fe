import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { TextboxComponent } from '../../../../shared/components/textbox/textbox';
import { DropdownComponent, OptionDropdown } from '../../../../shared/components/dropdown/dropdown';
import { AuthService } from '../../../../core/auth/auth.service';
import { CodeTypeService } from '../../../../core/services/code-type.service';
import { CODE_TYPES } from '../../../../core/constants/code-types.constants';
import { CustomValidators } from '../../../../core/utils/validators';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoPipe,
    ButtonComponent,
    TextboxComponent,
    DropdownComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './user-add.html',
  styleUrl: './user-add.css',
})
export class UserAdd {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  loading = signal<boolean>(false);

  rolesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.USER_ROLE).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });

  registerForm = this.fb.group({
    fullname: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        Validators.pattern(/^[a-zA-Z\s'. -]+$/),
      ],
    ],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_.]+$/),
      ],
    ],
    staff_id: ['', [Validators.required, Validators.maxLength(10)]],
    id_no: ['', [Validators.required, CustomValidators.idNoValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator()]],
    role_code: [null, [Validators.required]],
  });

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const errors: ValidationErrors = {};
      const username = this.registerForm?.get('username')?.value || '';

      if (value.length < 12) {
        errors['atLeast12Chars'] = true;
      }
      if (!/[A-Z]/.test(value)) {
        errors['oneUppercase'] = true;
      }
      if (!/[a-z]/.test(value)) {
        errors['oneLowercase'] = true;
      }
      if (!/\d/.test(value)) {
        errors['oneNumber'] = true;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors['oneSpecialChar'] = true;
      }
      if (username && value.toLowerCase().includes(username.toLowerCase())) {
        errors['containsUsername'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  goBack() {
    this.router.navigate(['admin/users']);
  }

  onSubmit() {
    console.log('this.registerForm.invalid', this.registerForm.invalid);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.confirmService.confirmSave(() => {
      this.loading.set(true);
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.toastService.success('Success', 'User registration successful');
            this.loading.set(false);
            this.goBack();
          } else {
            this.toastService.error('Error', response.message || 'Registration failed');
            this.loading.set(false);
          }
        },
        error: (error) => {
          this.toastService.error('Error', error.error?.message || 'Registration failed');
          this.loading.set(false);
        },
      });
    });
  }
}

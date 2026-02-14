import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { DateService } from '../../../core/services/date.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiResponse } from '../../../core/models/api.model';
import { UserDetailed } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { TextboxComponent } from '../../../shared/components/textbox/textbox';
import { ButtonComponent } from '../../../shared/components/button/button';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/dropdown/dropdown';
import { AuthService } from '../../../core/auth/auth.service';
import { CodeTypeService } from '../../../core/services/code-type.service';
import { CustomValidators } from '../../../core/utils/validators';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { DatePickerComponent } from '../../../shared/components/datepicker/datepicker';
import { RadioButtonComponent } from '../../../shared/components/radiobutton/radiobutton';
import { TranslocoPipe } from '@ngneat/transloco';
import { BaseFormComponent } from '../../../core/base/base-form.component';
import { AuditInfoComponent } from '../../../shared/components/audit-info/audit-info';

const ADDRESS_FIELDS = ['address_line_1', 'address_line_2', 'city', 'postcode', 'state', 'country'];
const ADDRESS_REFERENCE_FIELDS = ['state', 'country'];
const REFERENCE_FIELDS = ['gender', 'role', 'status', 'department'];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CardModule,
    AvatarModule,
    FileUploadModule,
    TextboxComponent,
    ButtonComponent,
    DropdownComponent,
    DatePickerComponent,
    RadioButtonComponent,
    TranslocoPipe,
    SkeletonModule,
    AuditInfoComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile extends BaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);
  private dateService = inject(DateService);

  profileForm: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  profileImageUrl = signal<string | null>(null);
  rolesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.USER_ROLE).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });
  countriesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.COUNTRY).map((country) => ({
      value: country.code,
      label: country.description,
    }));
  });
  statesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.STATE).map((state) => ({
      value: state.code,
      label: state.description,
    }));
  });
  genderOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.GENDER).map((gender) => ({
      value: gender.code,
      label: gender.description,
    }));
  });

  statusOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.USER_STATUS).map((status) => ({
      value: status.code,
      label: status.description,
    }));
  });

  departmentOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.DEPARTMENT).map((department) => ({
      value: department.code,
      label: department.description,
    }));
  });

  userId: number | null = null;
  originalData: any = null;

  constructor() {
    super();
    this.profileForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      shortname: ['', [Validators.maxLength(20)]],
      username: [{ value: '', disabled: true }],
      staff_id: ['', [Validators.maxLength(10)]],
      id_no: ['', [Validators.required, CustomValidators.idNoValidator()]],
      gender: [{ value: '', validators: [Validators.required] }],
      role: [{ value: '', validators: [Validators.required] }],
      status: [{ value: '', validators: [Validators.required] }],
      email: ['', [Validators.required, Validators.email]],
      phone_no: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(15)],
      ],
      department: [{ value: '' }],
      designation: ['', [Validators.maxLength(120)]],
      remarks: ['', [Validators.maxLength(255)]],
      address_line_1: ['', [Validators.maxLength(255)]],
      address_line_2: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.maxLength(120)]],
      postcode: ['', [Validators.maxLength(6)]],
      state: [{ value: '' }],
      country: [{ value: '' }],
      joined_dt: [''],
      created_by: [{ value: '', disabled: true }],
      created_at: [{ value: '', disabled: true }],
      updated_by: [{ value: '', disabled: true }],
      updated_at: [{ value: '', disabled: true }],
    });
  }

  hasUnsavedChanges(): boolean {
    return this.profileForm.dirty;
  }

  ngOnInit() {
    this.setupFormListeners();
    this.loadProfile();
  }

  private setupFormListeners() {
    this.profileForm
      .get('country')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryCode) => {
        const stateControl = this.profileForm.get('state');
        if (countryCode && countryCode !== 'MY') {
          stateControl?.setValue('');
          stateControl?.disable({ emitEvent: false });
        } else {
          stateControl?.enable({ emitEvent: false });
        }
      });
  }

  loadProfile() {
    const username = this.authService.currentUser()?.username;
    if (!username) {
      this.toastService.error('Error', 'User session not found');
      return;
    }

    this.isLoading.set(true);
    this.userService.getUserByUsername(username).subscribe({
      next: (response: ApiResponse<UserDetailed>) => {
        if (response.status === 200) {
          this.handleUserDataResponse(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load profile data');
        this.isLoading.set(false);
      },
    });
  }

  private mapApiDataToFormData(data: any) {
    const {
      fullname,
      shortname,
      username,
      staff_id,
      role,
      id_no,
      address,
      email,
      phone_no,
      status: userStatus,
      gender,
      department,
      designation,
      remarks,
      joined_dt,
      created_by,
      created_at,
      updated_by,
      updated_at,
    } = data;

    return {
      fullname,
      shortname,
      username,
      staff_id,
      id_no,
      email,
      phone_no: phone_no || '',
      gender: gender?.code || '',
      department: department?.code || '',
      designation,
      remarks,
      role: role.code,
      status: userStatus.code,
      joined_dt,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      postcode: address.postcode,
      state: address.state?.code || '',
      country: address.country?.code || '',
      created_by: created_by,
      created_at: this.dateService.formatAuditDate(created_at),
      updated_by: updated_by,
      updated_at: this.dateService.formatAuditDate(updated_at),
    };
  }

  private prepareDisplayData(formData: any, apiData: any) {
    return {
      ...formData,
      role_label: apiData.role.description,
      status_label: apiData.status.description,
      gender_label: apiData.gender?.description || '',
    };
  }

  private handleUserDataResponse(data: any) {
    this.userId = data.id;

    const formData = this.mapApiDataToFormData(data);
    this.profileForm.patchValue(formData);
    this.profileForm.markAsPristine();

    this.originalData = this.prepareDisplayData(formData, data);

    if (data.profile_image_url) {
      this.profileImageUrl.set(`${environment.apiUrl}${data.profile_image_url}`);
    }
  }

  resetForm() {
    this.profileForm.reset();
    this.profileForm.patchValue(this.originalData);
    this.profileForm.markAsPristine();
  }

  onSave() {
    if (this.profileForm.invalid || !this.userId) return;

    // Identify changed fields
    const currentValues = this.profileForm.getRawValue();
    const updateData: any = {};
    let addressUpdated = false;

    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key] !== this.originalData[key]) {
        if (ADDRESS_FIELDS.includes(key)) {
          if (!updateData.address) updateData.address = {};

          if (ADDRESS_REFERENCE_FIELDS.includes(key)) {
            updateData.address[key] = { code: currentValues[key] };
          } else {
            updateData.address[key] = currentValues[key];
          }
          addressUpdated = true;
        } else if (REFERENCE_FIELDS.includes(key)) {
          updateData[key] = { code: currentValues[key] };
        } else {
          updateData[key] = currentValues[key];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      this.toastService.info('No changes', 'No modifications were detected.');
      return;
    }

    this.confirmService.confirmSave(() => {
      this.isSaving.set(true);
      this.userService.updateUser(this.userId!, updateData).subscribe({
        next: (response: ApiResponse<UserDetailed>) => {
          if (response.status === 200) {
            this.toastService.success('Success', 'Profile updated successfully');
            this.handleUserDataResponse(response.data); // Use the response data directly
          }
          this.isSaving.set(false);
        },
        error: (err: any) => {
          this.toastService.error('Error', 'Failed to update profile');
          this.isSaving.set(false);
        },
      });
    });
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
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
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);

  profileForm: FormGroup;
  isLoading = signal<boolean>(false);
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

  userId: number | null = null;
  originalData: any = null;

  constructor() {
    this.profileForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      shortname: ['', [Validators.maxLength(20)]],
      username: [{ value: '', disabled: true }],
      id_no: ['', [Validators.required, CustomValidators.idNoValidator()]],
      gender: [{ value: '', validators: [Validators.required] }],
      role: [{ value: '', validators: [Validators.required] }],
      status: [{ value: '', validators: [Validators.required] }],
      email: ['', [Validators.required, Validators.email]],
      address_line_1: ['', [Validators.maxLength(255)]],
      address_line_2: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.maxLength(120)]],
      postcode: ['', [Validators.maxLength(6)]],
      state: [{ value: '' }],
      country: [{ value: '' }],
      joined_dt: [''],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const username = this.authService.currentUser()?.username;
    if (!username) {
      this.toastService.error('Error', 'User session not found');
      return;
    }

    this.isLoading.set(true);
    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.handleUserDataResponse(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Error', 'Failed to load profile data');
        this.isLoading.set(false);
      },
    });
  }

  private handleUserDataResponse(data: any) {
    const {
      id,
      fullname,
      shortname,
      username,
      role,
      profile_image_url,
      id_no,
      address,
      email,
      status,
      gender,
      joined_dt,
    } = data;

    this.userId = id;
    const formData = {
      fullname,
      shortname,
      username,
      id_no,
      email,
      gender: gender?.code || '',
      role: role.code,
      status: status.code,
      joined_dt,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      postcode: address.postcode,
      state: address.state.code,
      country: address.country.code,
    };

    this.profileForm.patchValue(formData);
    this.originalData = { ...formData }; // Store a copy

    if (profile_image_url) {
      this.profileImageUrl.set(`${environment.apiUrl}${profile_image_url}`);
    }
  }

  onSave() {
    if (this.profileForm.invalid || !this.userId) return;

    // Identify changed fields
    const currentValues = this.profileForm.getRawValue();
    const updateData: any = {};
    const addressFields = [
      'address_line_1',
      'address_line_2',
      'city',
      'postcode',
      'state',
      'country',
    ];
    let addressUpdated = false;

    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key] !== this.originalData[key]) {
        if (addressFields.includes(key)) {
          if (!updateData.address) updateData.address = {};

          if (key === 'state' || key === 'country') {
            updateData.address[key] = { code: currentValues[key] };
          } else {
            updateData.address[key] = currentValues[key];
          }
          addressUpdated = true;
        } else if (['gender', 'role', 'status'].includes(key)) {
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
        next: (response) => {
          if (response.status === 200) {
            this.toastService.success('Success', 'Profile updated successfully');
            this.handleUserDataResponse(response.data); // Use the response data directly
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.toastService.error('Error', 'Failed to update profile');
          this.isSaving.set(false);
        },
      });
    });
  }
}

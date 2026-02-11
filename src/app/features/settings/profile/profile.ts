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
    return this.codeTypeService.getSystemCodes('CTRY').map((country) => ({
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

  constructor() {
    this.profileForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      username: [{ value: '', disabled: true }],
      id_no: ['', [Validators.required, CustomValidators.idNoValidator()]],
      role: [{ value: '', validators: [Validators.required] }],
      address_line_1: ['', [Validators.required, Validators.maxLength(255)]],
      address_line_2: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(120)]],
      postcode: ['', [Validators.required, Validators.maxLength(6)]],
      state: [{ value: '', validators: [Validators.required] }],
      country: [{ value: '', validators: [Validators.required] }],
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
          const { fullname, username, role, profile_image_url, id_no, address } = response.data;
          // Patch form with role code instead of object for the dropdown
          this.profileForm.patchValue({
            fullname,
            username,
            id_no,
            role: role.code,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            city: address.city,
            postcode: address.postcode,
            state: address.state.code,
            country: address.country.code,
          });
          if (profile_image_url) {
            this.profileImageUrl.set(`${environment.apiUrl}${profile_image_url}`);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Error', 'Failed to load profile data');
        this.isLoading.set(false);
      },
    });
  }

  onSave() {
    if (this.profileForm.invalid) return;

    this.confirmService.confirmSave(() => {
      this.isSaving.set(true);
      // Simulation of save since there is no updateProfile yet in service
      setTimeout(() => {
        this.toastService.success('Success', 'Profile updated successfully');
        this.isSaving.set(false);
      }, 1000);
    });
  }
}

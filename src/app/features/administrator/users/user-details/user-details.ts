import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
  DestroyRef,
  viewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { ScrollTopModule } from 'primeng/scrolltop';
import { MenuItem } from 'primeng/api';

import { DateService } from '../../../../core/services/date.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiResponse } from '../../../../core/models/api.model';
import { UserDetailed } from '../../../../core/models/user.model';
import { environment } from '../../../../../environments/environment';
import { TextboxComponent } from '../../../../shared/components/textbox/textbox';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { DropdownComponent, OptionDropdown } from '../../../../shared/components/dropdown/dropdown';
import { AuthService } from '../../../../core/auth/auth.service';
import { CodeTypeService } from '../../../../core/services/code-type.service';
import { CustomValidators } from '../../../../core/utils/validators';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { CODE_TYPES } from '../../../../core/constants/code-types.constants';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DatePickerComponent } from '../../../../shared/components/datepicker/datepicker';
import { RadioButtonComponent } from '../../../../shared/components/radiobutton/radiobutton';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { BaseFormComponent } from '../../../../core/base/base-form.component';
import { AuditInfoComponent } from '../../../../shared/components/audit-info/audit-info';
import { ImageCropDialog } from '../../../../shared/components/image-crop-dialog/image-crop-dialog';
import { AvatarSelectionDialog } from '../../../../shared/components/avatar-selection-dialog/avatar-selection-dialog';

const ADDRESS_FIELDS = ['address_line_1', 'address_line_2', 'city', 'postcode', 'state', 'country'];
const ADDRESS_REFERENCE_FIELDS = ['state', 'country'];
const REFERENCE_FIELDS = ['gender', 'role', 'status', 'department'];

@Component({
  selector: 'app-user-details',
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
    ImageCropDialog,
    AvatarSelectionDialog,
    MenuModule,
    ScrollTopModule,
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class UserDetails extends BaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);
  private dateService = inject(DateService);
  private translocoService = inject(TranslocoService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userDetailsForm: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isUploadingPhoto = signal<boolean>(false);

  private fetchedUser = signal<UserDetailed | null>(null);
  private refreshSig = signal<number>(0);

  profileImageUrl = computed(() => {
    this.refreshSig(); // Dependency for forcing reload
    const user = this.fetchedUser();
    if (!user?.profile_image_url) return undefined;

    const baseUrl = environment.apiUrl.endsWith('/')
      ? environment.apiUrl.slice(0, -1)
      : environment.apiUrl;
    const path = user.profile_image_url.startsWith('/')
      ? user.profile_image_url
      : `/${user.profile_image_url}`;

    return `${baseUrl}${path}?t=${new Date().getTime()}`;
  });

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  cropDialog = viewChild<ImageCropDialog>('cropDialog');
  avatarDialog = viewChild<AvatarSelectionDialog>('avatarDialog');
  showScrollDown = signal<boolean>(true);

  private translationLoaded = toSignal(this.translocoService.selectTranslation());

  menuItems = computed<MenuItem[]>(() => {
    this.translationLoaded(); // Depend on translation being loaded
    return [
      {
        label: this.getTranslation('profile.upload_photo'),
        icon: 'pi pi-upload',
        command: () => this.fileInput()?.nativeElement.click(),
      },
      {
        label: this.getTranslation('profile.choose_avatar'),
        icon: 'pi pi-user',
        command: () => this.avatarDialog()?.open(),
      },
      {
        separator: true,
        visible: !!this.profileImageUrl(),
      },
      {
        label: this.getTranslation('profile.remove_photo'),
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        visible: !!this.profileImageUrl(),
        command: () => this.removeProfilePhoto(),
      },
    ];
  });

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
    this.userDetailsForm = this.fb.group({
      fullname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(80),
          Validators.pattern(/^[a-zA-Z\s'. -]+$/),
        ],
      ],
      shortname: ['', [Validators.maxLength(20), Validators.pattern(/^[a-zA-Z\s'. -]+$/)]],
      username: [
        '',
        [
          Validators.minLength(5),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/),
        ],
      ],
      staff_id: ['', [Validators.maxLength(10)]],
      id_no: ['', [Validators.required, CustomValidators.idNoValidator()]],
      gender: [''],
      role: ['', [Validators.required]],
      status: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      phone_no: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(15)],
      ],
      department: [''],
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
    return this.userDetailsForm.dirty;
  }

  ngOnInit() {
    this.formOnChanges();
    this.initFacade();
  }

  private formOnChanges() {
    this.userDetailsForm
      .get('country')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryCode) => {
        const stateControl = this.userDetailsForm.get('state');
        if (countryCode && countryCode !== 'MY') {
          stateControl?.setValue('');
          stateControl?.disable({ emitEvent: false });
        } else {
          stateControl?.enable({ emitEvent: false });
        }
      });

    this.userDetailsForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((username) => {
        const currentUser = this.fetchedUser();

        // Skip check if username is empty or same as current
        if (
          !username ||
          username.length < 5 ||
          (currentUser && username === currentUser.username)
        ) {
          const errors = this.userDetailsForm.get('username')?.errors;
          if (errors) {
            delete errors['notAvailable'];
            this.userDetailsForm
              .get('username')
              ?.setErrors(Object.keys(errors).length ? errors : null);
          }
          return;
        }

        this.userService.checkUsernameAvailability(username).subscribe({
          next: (response: ApiResponse<{ available: boolean }>) => {
            if (response.status === 200) {
              if (response.data && response.data.available === false) {
                const control = this.userDetailsForm.get('username');
                control?.setErrors({ notAvailable: true }, { emitEvent: true });
                control?.markAsDirty();
                control?.markAsTouched();
              } else {
                const errors = this.userDetailsForm.get('username')?.errors;
                if (errors && errors['notAvailable']) {
                  delete errors['notAvailable'];
                  this.userDetailsForm
                    .get('username')
                    ?.setErrors(Object.keys(errors).length ? errors : null);
                }
              }
            }
          },
          error: (err: any) => {
            this.toastService.error('Error', 'Failed to check username availability');
          },
        });
      });
  }

  initFacade() {
    const userIdOrUsername = this.route.snapshot.paramMap.get('id');
    if (!userIdOrUsername) {
      this.toastService.error('Error', 'User ID not provided');
      this.goBack();
      return;
    }

    this.isLoading.set(true);
    // Use getUserByUsername as it handles strings (which the ID param will be)
    // and correctly filters in the backend if it's a numeric ID or a string username
    this.userService.getUserById(parseInt(userIdOrUsername)).subscribe({
      next: (response: ApiResponse<UserDetailed>) => {
        if (response.status === 200) {
          this.handleUserDataResponse(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load user data');
        this.isLoading.set(false);
        this.goBack();
      },
    });
  }

  private handleUserDataResponse(data: UserDetailed) {
    this.userId = data.id;
    this.fetchedUser.set(data);

    const formData = this.patchForm(data);
    this.userDetailsForm.patchValue(formData);
    this.userDetailsForm.markAsPristine();

    this.originalData = this.prepareDisplayData(formData, data);
  }

  private patchForm(data: any) {
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
      status: userStatus.description,
      joined_dt,
      address_line_1: address?.address_line_1 || '',
      address_line_2: address?.address_line_2 || '',
      city: address?.city || '',
      postcode: address?.postcode || '',
      state: address?.state?.code || '',
      country: address?.country?.code || '',
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

  goBack() {
    this.router.navigate(['admin/users']);
  }

  resetForm() {
    this.userDetailsForm.reset();
    this.userDetailsForm.patchValue(this.originalData);
    this.userDetailsForm.markAsPristine();
  }

  onSave() {
    if (this.userDetailsForm.invalid || !this.userId) return;

    const currentValues = this.userDetailsForm.getRawValue();
    const updateData: any = {};

    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key] !== this.originalData[key]) {
        if (ADDRESS_FIELDS.includes(key)) {
          if (!updateData.address) updateData.address = {};
          if (ADDRESS_REFERENCE_FIELDS.includes(key)) {
            updateData.address[key] = { code: currentValues[key] };
          } else {
            updateData.address[key] = currentValues[key];
          }
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
            this.toastService.success('Success', 'User updated successfully');
            this.handleUserDataResponse(response.data);
          }
          this.isSaving.set(false);
        },
        error: (err: any) => {
          this.toastService.error('Error', 'Failed to update user');
          this.isSaving.set(false);
        },
      });
    });
  }

  onProfilePictureClick() {
    const input = this.fileInput()?.nativeElement;
    if (input) input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('Error', this.getTranslation('profile.photo_size_error'));
      input.value = '';
      return;
    }

    const dialog = this.cropDialog();
    if (dialog) dialog.open(event);
  }

  onImageCropped(blob: Blob) {
    if (!this.userId) return;

    this.isUploadingPhoto.set(true);
    const formData = new FormData();
    formData.append('file', blob, 'profile.png');

    this.userService.updateProfilePhoto(this.userId, formData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === 201 || response.status === 200) {
          this.toastService.success('Success', this.getTranslation('profile.photo_upload_success'));
          const d = response.data || {};
          const path = d.FilePath || d.filePath || d.FileUrl || d.fileUrl || d.Path || d.path;

          if (path) {
            this.fetchedUser.update((user) => (user ? { ...user, profile_image_url: path } : null));
            this.refreshSig.update((n) => n + 1);
          }
        }
        this.isUploadingPhoto.set(false);
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
      },
      error: (err: any) => {
        this.toastService.error('Error', this.getTranslation('profile.photo_upload_error'));
        this.isUploadingPhoto.set(false);
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
      },
    });
  }

  removeProfilePhoto() {
    if (!this.userId) return;

    this.confirmService.confirm({
      message: this.getTranslation('confirm.remove_photo.message'),
      header: this.getTranslation('confirm.remove_photo.header'),
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: this.getTranslation('confirm.remove_photo.reject'),
      acceptLabel: this.getTranslation('confirm.remove_photo.accept'),
      acceptButtonProps: {
        label: this.getTranslation('confirm.remove_photo.accept'),
        severity: 'danger',
        size: 'small',
      },
      rejectButtonProps: {
        label: this.getTranslation('confirm.remove_photo.reject'),
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      accept: () => {
        this.isUploadingPhoto.set(true);
        this.userService.deleteProfilePhoto(this.userId!).subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.status === 200) {
              this.toastService.success(
                'Success',
                this.getTranslation('profile.photo_remove_success'),
              );
              this.fetchedUser.update((user) =>
                user ? { ...user, profile_image_url: null } : null,
              );
              this.refreshSig.update((n) => n + 1);
            }
            this.isUploadingPhoto.set(false);
          },
          error: (err: any) => {
            this.toastService.error('Error', this.getTranslation('profile.photo_remove_error'));
            this.isUploadingPhoto.set(false);
          },
        });
      },
    });
  }

  private getTranslation(key: string): string {
    return this.translocoService.translate(key);
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

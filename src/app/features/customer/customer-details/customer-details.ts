import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ElementRef,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { CardComponent } from '../../../shared/components/layout/card/card';
import { TabsModule } from 'primeng/tabs';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { Customer } from '../../../core/models/customer.model';
import { CustomerGeneral } from './general/general';
import { CustomerDirectors } from './directors/directors';
import { CustomerShareholders } from './shareholders/shareholders';
import { ImageCropDialog } from '../../../shared/components/form/image-crop-dialog/image-crop-dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-details',
  imports: [
    PageHeaderComponent,
    PageContainerComponent,
    CardComponent,
    TabsModule,
    CustomerGeneral,
    CustomerDirectors,
    CustomerShareholders,
    SkeletonModule,
    MenuModule,
    TranslocoPipe,
    ImageCropDialog,
  ],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private translocoService = inject(TranslocoService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(false);
  customer = signal<Customer | null>(null);
  customerInsight = signal<string | null>(null);
  isLoadingInsight = signal(false);
  isUploadingPhoto = signal(false);
  profileImageUrl = signal<string | undefined>(undefined);

  activeTab = signal('general');

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  cropDialog = viewChild<ImageCropDialog>('cropDialog');

  private translationLoaded = toSignal(this.translocoService.selectTranslation());

  menuItems = computed<MenuItem[]>(() => {
    this.translationLoaded();
    return [
      {
        label: this.translocoService.translate('profile.upload_photo'),
        icon: 'pi pi-upload',
        command: () => this.fileInput()?.nativeElement.click(),
      },
      {
        separator: true,
        visible: !!this.profileImageUrl(),
      },
      {
        label: this.translocoService.translate('profile.remove_photo'),
        icon: 'pi pi-trash',
        styleClass: 'text-red-600',
        visible: !!this.profileImageUrl(),
        command: () => this.removeProfilePhoto(),
      },
    ];
  });

  readonly tabs = [
    { label: 'General', value: 'general', icon: 'pi pi-building' },
    { label: 'Directors', value: 'directors', icon: 'pi pi-users' },
    { label: 'Shareholders', value: 'shareholders', icon: 'pi pi-chart-pie' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        this.customer.set(response.result);
        this.profileImageUrl.set(this.buildImageUrl(response.result.profile_photo));
        this.loading.set(false);
        this.fetchCustomerInsight(response.result.id);
      },
      error: () => this.loading.set(false),
    });
  }

  private fetchCustomerInsight(id: number) {
    this.isLoadingInsight.set(true);
    this.customerService.getCustomerInsight(id).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.customerInsight.set(response.result);
        }
        this.isLoadingInsight.set(false);
      },
      error: () => this.isLoadingInsight.set(false),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('Error', this.translocoService.translate('profile.photo_size_error'));
      input.value = '';
      return;
    }

    const dialog = this.cropDialog();
    if (dialog) dialog.open(event);
  }

  onImageCropped(blob: Blob) {
    const customerId = this.customer()?.id;
    if (!customerId) return;

    this.isUploadingPhoto.set(true);
    const formData = new FormData();
    formData.append('file', blob, 'photo.png');

    this.customerService.uploadCustomerLogo(customerId, formData).subscribe({
      next: (response) => {
        if (response.status === 200 || response.status === 201) {
          this.toastService.success(
            'Success',
            this.translocoService.translate('profile.photo_upload_success'),
          );
          this.customerService.getCustomerById(customerId).subscribe({
            next: (refetch) => {
              this.customer.set(refetch.result);
              this.profileImageUrl.set(this.buildImageUrl(refetch.result.profile_photo));
              this.cdr.markForCheck();
            },
          });
        }
        this.isUploadingPhoto.set(false);
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
      },
      error: () => {
        this.toastService.error(
          'Error',
          this.translocoService.translate('profile.photo_upload_error'),
        );
        this.isUploadingPhoto.set(false);
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
      },
    });
  }

  removeProfilePhoto() {
    this.profileImageUrl.set(undefined);
  }

  private buildImageUrl(rawPath: string | null | undefined): string | undefined {
    if (!rawPath) return undefined;
    let baseUrl = environment.apiUrl.endsWith('/')
      ? environment.apiUrl.slice(0, -1)
      : environment.apiUrl;
    baseUrl = `${baseUrl}/api`;
    if (rawPath.startsWith('http')) {
      return `${rawPath}${rawPath.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    const formattedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${baseUrl}${formattedPath}?t=${Date.now()}`;
  }
}

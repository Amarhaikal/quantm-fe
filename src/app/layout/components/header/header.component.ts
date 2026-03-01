import {
  Component,
  computed,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../../../core/constants/storage.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { Badge } from 'primeng/badge';
import { Popover } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  iconColor: string;
  read: boolean;
  type: 'loan_approved' | 'loan_rejected' | 'payment_due' | 'new_application' | 'document_required';
}

@Component({
  selector: 'app-header',
  imports: [
    Avatar,
    Menu,
    ButtonModule,
    ToggleSwitch,
    FormsModule,
    CommonModule,
    Badge,
    Popover,
    DividerModule,
  ],
  templateUrl: './header.component.html',
  styles: [
    `
      :host ::ng-deep .p-avatar {
        width: 40px !important;
        height: 40px !important;
        flex-shrink: 0 !important;
      }
      :host ::ng-deep .p-avatar img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      :host ::ng-deep .lang-toggle-switch .p-toggleswitch-handle {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 32px !important;
        height: 20px !important;
        top: 3px !important;
        left: 3px !important;
        border-radius: 12px !important;
        transition: transform 0.2s !important;
      }
      :host ::ng-deep .lang-toggle-switch.p-toggleswitch {
        width: 62px !important;
        height: 26px !important;
        background: #e2e8f0 !important; /* Fixed gray background */
        border: none !important;
        border-radius: 13px !important;
      }
      :host ::ng-deep .lang-toggle-switch.p-toggleswitch.p-toggleswitch-checked {
        background: #e2e8f0 !important; /* Keep gray when checked */
      }
      :host
        ::ng-deep
        .lang-toggle-switch.p-toggleswitch.p-toggleswitch-checked
        .p-toggleswitch-handle {
        transform: translateX(
          24px
        ) !important; /* Precise move for 62px width - 32px handle - 3px-3px padding */
      }
      :host ::ng-deep .lang-toggle-switch .p-toggleswitch-slider {
        background: transparent !important;
        border: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private menuService = inject(MenuService);
  private translocoService = inject(TranslocoService);
  private router = inject(Router);
  private authService = inject(AuthService);

  private activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  isMalay = computed(() => this.activeLang() === 'my');

  notifications = signal<AppNotification[]>([
    {
      id: 1,
      title: 'Loan Application Approved',
      message: "Ahmad Razif's loan application #LN-2024-001 has been approved for RM 50,000.",
      time: '5 min ago',
      icon: 'pi-check-circle',
      iconColor: 'text-green-500',
      read: false,
      type: 'loan_approved',
    },
    {
      id: 2,
      title: 'Payment Due Reminder',
      message: 'Loan #LN-2023-087 payment of RM 1,250 is due in 3 days.',
      time: '1 hour ago',
      icon: 'pi-clock',
      iconColor: 'text-amber-500',
      read: false,
      type: 'payment_due',
    },
    {
      id: 3,
      title: 'New Loan Application',
      message: 'Siti Norsham submitted a new loan application of RM 25,000.',
      time: '2 hours ago',
      icon: 'pi-file',
      iconColor: 'text-blue-500',
      read: false,
      type: 'new_application',
    },
    {
      id: 4,
      title: 'Document Required',
      message: 'Loan #LN-2024-015: Supporting documents are needed for verification.',
      time: 'Yesterday',
      icon: 'pi-exclamation-triangle',
      iconColor: 'text-orange-500',
      read: true,
      type: 'document_required',
    },
    {
      id: 5,
      title: 'Loan Application Rejected',
      message:
        "Mohd Faizal's loan application #LN-2024-009 has been rejected. Reason: Insufficient income.",
      time: '2 days ago',
      icon: 'pi-times-circle',
      iconColor: 'text-red-500',
      read: true,
      type: 'loan_rejected',
    },
  ]);

  notificationCount = computed(() => this.notifications().filter((n) => !n.read).length);

  markAsRead(id: number) {
    this.notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllRead() {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  userData = input<{
    fullname: string;
    shortname: string;
    username: string;
    profile_photo: string | null;
  } | null>(null);
  logout = output<void>();

  toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  // Reactive signal that triggers when the translation file is fully loaded
  private translationLoaded = toSignal(this.translocoService.selectTranslation());

  menuItems = computed<MenuItem[]>(() => {
    const translations = this.translationLoaded();
    if (!translations) return [];

    return [
      {
        label: this.translocoService.translate('sidemenu.profile'),
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/settings/profile']);
        },
      },
      {
        separator: true,
      },
      {
        label: this.translocoService.translate('sidemenu.logout'),
        icon: 'pi pi-sign-out',
        command: () => {
          this.onLogout();
        },
      },
    ];
  });

  profileImageUrl = this.authService.profileImageUrl;

  onLogout() {
    this.logout.emit();
  }

  onLanguageChange(checked: boolean) {
    const lang = checked ? 'my' : 'en';
    this.translocoService.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }
}

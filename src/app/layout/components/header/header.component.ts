import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../environments/environment';
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

@Component({
  selector: 'app-header',
  imports: [Avatar, Menu, ButtonModule, ToggleSwitch, FormsModule, CommonModule],
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

  isMalay = computed(() => this.translocoService.getActiveLang() === 'my');

  userData = input<{
    fullname: string;
    shortname: string;
    username: string;
    profile_image_url: string;
  } | null>(null);
  logout = output<void>();

  toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => {
        // Navigate to profile if needed
        this.router.navigate(['/settings/profile']);
      },
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.onLogout();
      },
    },
  ];

  profileImageUrl = computed(() => {
    const user = this.userData();
    if (!user?.profile_image_url) return undefined;
    return `${environment.apiUrl}${user.profile_image_url}`;
  });

  onLogout() {
    this.logout.emit();
  }

  onLanguageChange(checked: boolean) {
    const lang = checked ? 'my' : 'en';
    this.translocoService.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }
}

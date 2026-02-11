import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-header',
  imports: [Avatar, Menu, ButtonModule],
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private menuService = inject(MenuService);

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
}

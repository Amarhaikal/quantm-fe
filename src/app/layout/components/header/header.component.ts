import { Component, computed, input, output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [Avatar, Menu],
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
})
export class HeaderComponent {
  userData = input<{ name: string; username: string; profile_image_url: string } | null>(null);
  logout = output<void>();

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

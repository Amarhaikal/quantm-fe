import {
  Component,
  inject,
  viewChild,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { MenuService } from '../../../core/services/menu.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [AvatarModule, ButtonModule, DrawerModule, RippleModule],
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidemenu {
  menuService = inject(MenuService);
  drawerRef = viewChild<Drawer>('drawerRef');

  userData = input<{ name: string; username: string; profile_image_url: string } | null>(null);

  profileImageUrl = computed(() => {
    const user = this.userData();
    if (!user?.profile_image_url) return undefined;
    return `${environment.apiUrl}${user.profile_image_url}`;
  });

  closeCallback(e: Event): void {
    this.drawerRef()?.close(e);
  }
}

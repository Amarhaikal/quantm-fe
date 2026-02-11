import {
  Component,
  inject,
  viewChild,
  ChangeDetectionStrategy,
  computed,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [
    AvatarModule,
    ButtonModule,
    DrawerModule,
    RippleModule,
    NgOptimizedImage,
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: '0',
          overflow: 'hidden',
          paddingTop: '0',
          paddingBottom: '0',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: '1',
        }),
      ),
      transition('collapsed <=> expanded', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')]),
    ]),
  ],
})
export class Sidemenu implements OnInit {
  menuService = inject(MenuService);
  drawerRef = viewChild<Drawer>('drawerRef');

  userData = input<{
    fullname: string;
    shortname: string;
    username: string;
    profile_image_url: string;
  } | null>(null);
  menuData = signal<any[]>([]);

  // Track expanded menu items by ID using a Signal
  expandedItems = signal<Set<number>>(new Set());

  profileImageUrl = computed(() => {
    const user = this.userData();
    if (!user?.profile_image_url) return undefined;
    return `${environment.apiUrl}${user.profile_image_url}`;
  });

  ngOnInit() {
    this.menuService.getMenu().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.menuData.set(response.data);

          // Expand all items that have children by default
          const idsToExpand = new Set<number>();
          response.data.forEach((item: any) => {
            if (item.childs && item.childs.length > 0) {
              idsToExpand.add(item.id);
            }
          });
          this.expandedItems.set(idsToExpand);
        }
      },
      error: (err) => {
        console.error('Failed to fetch menu data:', err);
      },
    });
  }

  toggleItem(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.expandedItems.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedItems().has(id);
  }

  closeCallback(e: Event): void {
    this.drawerRef()?.close(e);
  }
}

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
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoPipe } from '@ngneat/transloco';
import { MenuService } from '../../../core/services/menu.service';
import { STORAGE_KEYS } from '../../../core/constants/storage.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [
    AvatarModule,
    ButtonModule,
    DrawerModule,
    RippleModule,
    SkeletonModule,
    NgOptimizedImage,
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    TooltipModule,
    TranslocoPipe,
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
  private authService = inject(AuthService);
  drawerRef = viewChild<Drawer>('drawerRef');

  userData = input<{
    fullname: string;
    shortname: string;
    username: string;
    profile_image_url: string | null;
  } | null>(null);
  menuData = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');

  // Track expanded menu items by ID using a Signal
  expandedItems = signal<Set<number>>(new Set());

  profileImageUrl = this.authService.profileImageUrl;

  isSidebarExpanded = computed(() => this.menuService.isSidebarVisible());
  isMini = computed(() => this.menuService.isDesktop() && !this.menuService.isSidebarVisible());

  // Computed data for the mini sidebar (always show all clickable items)
  miniMenuItems = computed(() => {
    const flattened: any[] = [];
    this.menuData().forEach((item) => {
      if (item.url) {
        flattened.push(item);
      }
      if (item.childs && item.childs.length > 0) {
        item.childs.forEach((child: any) => {
          if (child.url) {
            flattened.push(child);
          }
        });
      }
    });
    return flattened;
  });

  // Computed data for the full sidebar (filtered by search query)
  filteredMenuData = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.menuData();

    return this.menuData()
      .map((item) => {
        const matchesParent = item.name.toLowerCase().includes(query);
        const matchedChilds =
          item.childs?.filter((child: any) => child.name.toLowerCase().includes(query)) || [];

        if (matchesParent || matchedChilds.length > 0) {
          // If query matched, expand this item automatically
          setTimeout(() => {
            this.expandedItems.update((prev) => new Set(prev).add(item.id));
          }, 0);

          return { ...item, childs: matchedChilds.length > 0 ? matchedChilds : item.childs };
        }
        return null;
      })
      .filter((item) => item !== null);
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
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch menu data:', err);
        this.isLoading.set(false);
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

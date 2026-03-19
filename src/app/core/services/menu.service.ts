import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, of } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private api = inject(ApiService);

  isSidebarVisible = signal<boolean>(true);
  isDesktop = signal<boolean>(true);
  cachedMenu = signal<any[] | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 1300px)');

      // Set initial state based on current window width
      this.isDesktop.set(!mediaQuery.matches);
      this.isSidebarVisible.set(!mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener('change', (e) => {
        this.isDesktop.set(!e.matches);
        this.isSidebarVisible.set(!e.matches);
      });
    }
  }

  toggleSidebar() {
    this.isSidebarVisible.update((v) => !v);
  }

  getMenu(forceRefresh = false): Observable<any> {
    const cached = this.cachedMenu();
    if (!forceRefresh && cached) {
      return of({ status: 200, result: cached, message: 'Menus retrieved from cache' });
    }
    
    return this.api.get<any>('menus').pipe(
      tap((res) => {
        if (res.status === 200) {
          this.cachedMenu.set(res.result);
        }
      })
    );
  }
  
  clearMenuCache() {
    this.cachedMenu.set(null);
  }
}

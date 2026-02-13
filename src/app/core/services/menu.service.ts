import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private api = inject(ApiService);

  isSidebarVisible = signal<boolean>(true);

  constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 1300px)');

      // Set initial state based on current window width
      this.isSidebarVisible.set(!mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener('change', (e) => {
        this.isSidebarVisible.set(!e.matches);
      });
    }
  }

  toggleSidebar() {
    this.isSidebarVisible.update((v) => !v);
  }

  getMenu(): Observable<UserResponse> {
    return this.api.get<UserResponse>('menu');
  }
}

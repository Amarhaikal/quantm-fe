import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private api = inject(ApiService);

  isSidebarVisible = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarVisible.update((v) => !v);
  }

  getMenu(): Observable<UserResponse> {
    return this.api.get<UserResponse>('menu');
  }
}

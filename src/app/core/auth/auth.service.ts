import { Injectable, signal, inject } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { ApiService } from '../services/api.service';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private userService = inject(UserService);

  // Signals for managing state
  private currentUserSig = signal<User | null>(null);
  private isHydratedSig = signal<boolean>(false);

  // Publicly exposed signals/state
  currentUser = this.currentUserSig.asReadonly();
  isHydrated = this.isHydratedSig.asReadonly();

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response) => {
        const userData = response.data?.user || (response.data as any);

        if (response.status === 200 && userData && (userData.username || userData.fullname)) {
          this.setUser(userData);
        }
      }),
    );
  }

  /**
   * Hydrates the user state from the server.
   * This is typically called by the AuthGuard or on app init.
   */
  hydrate(): Observable<User | null> {
    return this.userService.getMyProfile().pipe(
      map((response) => {
        if (response.status === 200) {
          const apiUser = response.data;
          const user: User = {
            id: 0,
            fullname: apiUser.fullname,
            username: apiUser.username,
            email: '',
            id_no: '',
            role: { id: 0, code: '', description: '' },
            profile_image_url: apiUser.profile_image_url,
          };
          this.setUser(user);
          return user;
        }
        this.setUser(null);
        return null;
      }),
      catchError((error) => {
        this.setUser(null);
        return [null];
      }),
    );
  }

  setUser(user: User | null) {
    this.currentUserSig.set(user);
    this.isHydratedSig.set(true);
  }

  logout() {
    // Call API to clear cookie
    this.api.post('auth/logout', {}).subscribe();
    this.setUser(null);
  }
}

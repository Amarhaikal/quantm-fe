import { Injectable, signal, inject } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth.model';
import { ApiService } from '../services/api.service';

import { UserService } from '../services/user.service';
import { UserDetailed } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private userService = inject(UserService);

  // Signals for managing state
  private currentUserSig = signal<UserDetailed | null>(null);
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
  hydrate(): Observable<UserDetailed | null> {
    return this.userService.getMyProfile().pipe(
      map((response) => {
        if (response.status === 200) {
          const apiUser = response.data;
          const user: UserDetailed = {
            id: 0,
            fullname: apiUser.fullname,
            shortname: apiUser.shortname,
            username: apiUser.username,
            email: '',
            id_no: '',
            phone_no: '',
            role: { code: '', description: '' },
            profile_image_url: apiUser.profile_image_url,
            gender: { code: '', description: '' },
            status: { code: '', description: '' },
            joined_dt: '',
            address: {
              address_line_1: '',
              address_line_2: '',
              city: '',
              postcode: '',
              state: { code: '', description: '' },
              country: { code: '', description: '' },
            },
            created_at: '',
            created_by: '',
            updated_at: null,
            updated_by: null,
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

  setUser(user: UserDetailed | null) {
    this.currentUserSig.set(user);
    this.isHydratedSig.set(true);
  }

  logout() {
    // Call API to clear cookie
    this.api.post('auth/logout', {}).subscribe();
    this.setUser(null);
  }
}

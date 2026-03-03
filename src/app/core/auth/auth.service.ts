import { Injectable, signal, inject, computed } from '@angular/core';
import { catchError, map, Observable, tap, Subscription, interval } from 'rxjs';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { AuthResponse } from '../models/auth.model';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

import { UserService } from '../services/user.service';
import { UserDetailed } from '../models/user.model';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private userService = inject(UserService);
  private httpBackend = inject(HttpBackend);
  private backendHttpClient = new HttpClient(this.httpBackend);
  private msalService = inject(MsalService);

  // Signals for managing state
  private currentUserSig = signal<UserDetailed | null>(null);
  private isHydratedSig = signal<boolean>(false);

  // Publicly exposed signals/state
  currentUser = this.currentUserSig.asReadonly();
  isHydrated = this.isHydratedSig.asReadonly();
  private refreshSig = signal<number>(0);
  refreshCounter = this.refreshSig.asReadonly();

  // Flag to prevent MSAL handleRedirectObservable from triggering loops
  msalRedirectProcessed = false;

  private refreshSubscription?: Subscription;

  profileImageUrl = computed(() => {
    const counter = this.refreshCounter();
    const user = this.currentUser();
    if (!user?.profile_photo) return undefined;

    const baseUrl = environment.apiUrl.endsWith('/')
      ? environment.apiUrl.slice(0, -1)
      : environment.apiUrl;
    const path = user.profile_photo.startsWith('/') ? user.profile_photo : `/${user.profile_photo}`;

    // Add timestamp to force browser to reload image if path is same
    // Using counter to ensure uniqueness on every refresh
    return `${baseUrl}${path}?t=${Date.now()}_${counter}`;
  });

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response) => {
        if (response.status === 200 && response.result) {
          this.setUser(response.result);
        }
      }),
    );
  }

  loginWithMicrosoft(idToken: string): Observable<AuthResponse> {
    const url = environment.apiUrl
      ? `${environment.apiUrl}/api/auth/login-microsoft`
      : '/api/auth/login-microsoft';

    return this.backendHttpClient
      .post<AuthResponse>(url, { microsoft_token: idToken }, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.status === 200 && response.result) {
            this.setUser(response.result);
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
        if (response.status === 200 && response.result) {
          const apiUser = response.result;
          const user: UserDetailed = {
            id: (apiUser as any).id || 0,
            fullname: apiUser.fullname || '',
            shortname: apiUser.shortname || '',
            username: apiUser.username || '',
            staff_no: (apiUser as any).staff_no || '',
            email: (apiUser as any).email || '',
            id_no: (apiUser as any).id_no || '',
            phone_no: (apiUser as any).phone_no || '',
            role: (apiUser as any).role || { code: '', description: '' },
            profile_photo: apiUser.profile_photo,
            gender: (apiUser as any).gender || { code: '', description: '' },
            status: (apiUser as any).status || { code: '', description: '' },
            joined_dt: (apiUser as any).joined_dt || '',
            department: (apiUser as any).department || { code: '', description: '' },
            designation: (apiUser as any).designation || '',
            remarks: (apiUser as any).remarks || '',
            address: (apiUser as any).address || {
              address_line1: '',
              address_line2: '',
              city: '',
              postcode: '',
              state: { code: '', description: '' },
              country: { code: '', description: '' },
            },
            created_at: (apiUser as any).created_at || '',
            created_by: (apiUser as any).created_by || '',
            updated_at: (apiUser as any).updated_at || null,
            updated_by: (apiUser as any).updated_by || null,
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
    this.triggerRefresh();

    if (user) {
      this.startTokenRefresh();
    } else {
      this.stopTokenRefresh();
    }
  }

  private startTokenRefresh() {
    this.stopTokenRefresh();
    // 29 minutes = 29 * 60 * 1000 = 1740000 ms
    this.refreshSubscription = interval(1740000).subscribe(() => {
      this.api.post('auth/refresh', {}).subscribe({
        error: (err) => console.error('Token refresh failed', err),
      });
    });
  }

  private stopTokenRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  updateProfileImage(photoUrl: string | null) {
    this.currentUserSig.update((user) => {
      if (!user) return null;
      // Ensure we return a new object reference to trigger signals
      return {
        ...user,
        profile_photo: photoUrl,
      };
    });
    this.triggerRefresh();
  }

  triggerRefresh() {
    this.refreshSig.update((n) => n + 1);
  }

  logout() {
    // Call API to clear cookie
    this.api.post('auth/logout', {}).subscribe();
    this.setUser(null);

    // Clear MSAL cache so handleRedirectObservable doesn't replay the old token
    try {
      this.msalService.instance.clearCache();
    } catch (e) {
      console.warn('Could not clear MSAL cache', e);
    }
  }

  register(data: any): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('auth/register', data);
  }
}

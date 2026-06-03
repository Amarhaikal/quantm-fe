import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, tap, Subscription, interval } from 'rxjs';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { AuthResponse } from '../models/auth.model';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

import { UserService } from '../services/user.service';
import { UserDetailed } from '../models/user.model';
import { MsalService } from '@azure/msal-angular';
import { ConfirmService } from '../services/confirm.service';
import { MenuService } from '../services/menu.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private userService = inject(UserService);
  private httpBackend = inject(HttpBackend);
  private backendHttpClient = new HttpClient(this.httpBackend);
  private msalService = inject(MsalService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private menuService = inject(MenuService);

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
  private idleTimer?: ReturnType<typeof setTimeout>;
  private warningTimer?: ReturnType<typeof setTimeout>;
  private lastActivityTime = 0;
  private readonly IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_BEFORE_IDLE_MS = 2 * 60 * 1000; // warn 2 min before logout
  private readonly REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly IDLE_EVENTS: (keyof WindowEventMap)[] = [
    'mousemove',
    'keydown',
    'mousedown',
    'touchstart',
    'scroll',
  ];
  private boundResetIdle = () => this.resetIdleTimer();

  profileImageUrl = computed(() => {
    const counter = this.refreshCounter();
    const user = this.currentUser();
    const photo = user?.profile_photo;
    if (!photo || photo === 'null' || photo === 'undefined' || photo.trim() === '') return undefined;

    let baseUrl = environment.apiUrl.endsWith('/')
      ? environment.apiUrl.slice(0, -1)
      : environment.apiUrl;
    baseUrl = `${baseUrl}/api`;
    const path = photo.startsWith('/') ? photo : `/${photo}`;

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
      this.startIdleDetection();
    } else {
      this.stopTokenRefresh();
      this.stopIdleDetection();
    }
  }

  private startTokenRefresh() {
    this.stopTokenRefresh();
    this.refreshSubscription = interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
      const idleDuration = Date.now() - this.lastActivityTime;
      // Skip refresh if user has been idle at or beyond the idle timeout threshold
      if (idleDuration >= this.IDLE_TIMEOUT_MS) {
        return;
      }
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

  private startIdleDetection() {
    this.IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, this.boundResetIdle, { passive: true }),
    );
    this.resetIdleTimer();
  }

  private stopIdleDetection() {
    this.IDLE_EVENTS.forEach((event) => window.removeEventListener(event, this.boundResetIdle));
    if (this.idleTimer !== undefined) {
      clearTimeout(this.idleTimer);
      this.idleTimer = undefined;
    }
    if (this.warningTimer !== undefined) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }
  }

  private resetIdleTimer() {
    this.lastActivityTime = Date.now();
    if (this.idleTimer !== undefined) {
      clearTimeout(this.idleTimer);
    }
    if (this.warningTimer !== undefined) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }
    // Show warning dialog 2 minutes before the idle timeout fires
    this.idleTimer = setTimeout(
      () => this.showIdleWarning(),
      this.IDLE_TIMEOUT_MS - this.WARNING_BEFORE_IDLE_MS,
    );
  }

  private showIdleWarning() {
    this.confirmService.confirmIdleWarning(
      // "Stay Logged In" — reset everything from scratch
      () => this.resetIdleTimer(),
      // "Logout Now" — fire immediately
      () => this.handleIdleTimeout(),
    );

    // Hard timer: if the user ignores the dialog, log out after 2 more minutes
    this.warningTimer = setTimeout(() => this.handleIdleTimeout(), this.WARNING_BEFORE_IDLE_MS);
  }

  private handleIdleTimeout() {
    // Call logout API with idle reason before clearing local state
    this.api.post('auth/logout', { reason: 'Idle Timeout' }).subscribe({
      complete: () => this.clearSessionLocally(true),
      error: () => this.clearSessionLocally(true),
    });
  }

  private clearSessionLocally(redirectToLogin = false) {
    this.stopIdleDetection();
    this.stopTokenRefresh();
    this.confirmService.close();
    this.currentUserSig.set(null);
    this.isHydratedSig.set(true);
    this.menuService.clearMenuCache();
    this.triggerRefresh();

    try {
      this.msalService.instance.clearCache();
    } catch (e) {
      console.warn('Could not clear MSAL cache', e);
    }

    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
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
    this.clearSessionLocally();
  }

  register(data: any): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('auth/register', data);
  }
}

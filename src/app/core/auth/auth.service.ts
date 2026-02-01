import { Injectable, signal, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);

  // Signals for managing state
  private currentUserSig = signal<User | null>(null);

  // Publicly exposed signals/state
  currentUser = this.currentUserSig.asReadonly();

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response) => {
        console.log('login response', response);

        if (response.status === 200 && response.data) {
          this.setSession(response.data);
        }
      }),
    );
  }

  private setSession(user: any) {
    console.log('setSession', user);

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSig.set(user);
  }

  logout() {
    // Call API to clear cookie
    this.api.post('auth/logout', {}).subscribe();
    localStorage.removeItem('user');
    this.currentUserSig.set(null);
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  // Signals for managing state
  private currentUserSig = signal<User | null>(null);

  // Publicly exposed signals/state
  currentUser = this.currentUserSig.asReadonly();

  constructor(private http: HttpClient) {
    // Need to hydrate state from LocalStorage on init (will do later)
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
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
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    localStorage.removeItem('user');
    this.currentUserSig.set(null);
  }
}

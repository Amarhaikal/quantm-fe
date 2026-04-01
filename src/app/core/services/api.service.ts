import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api`;

  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params,
      withCredentials: true,
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { withCredentials: true });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { withCredentials: true });
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params, withCredentials: true });
  }
}

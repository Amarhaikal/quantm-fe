import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse, UserUpdateDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getMyProfile(): Observable<UserResponse> {
    return this.api.get<UserResponse>('user/mini-profile');
  }

  getUserByUsername(username: string): Observable<UserResponse> {
    return this.api.get<UserResponse>(`user/username/${username}`);
  }

  updateUser(id: number, data: UserUpdateDto): Observable<UserResponse> {
    return this.api.put<UserResponse>(`user/${id}`, data);
  }
}

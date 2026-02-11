import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { UserDetailed, UserMiniProfile, UserUpdateDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getMyProfile(): Observable<ApiResponse<UserMiniProfile>> {
    return this.api.get<ApiResponse<UserMiniProfile>>('user/mini-profile');
  }

  getUserByUsername(username: string): Observable<ApiResponse<UserDetailed>> {
    return this.api.get<ApiResponse<UserDetailed>>(`user/username/${username}`);
  }

  updateUser(id: number, data: UserUpdateDto): Observable<ApiResponse<UserDetailed>> {
    return this.api.put<ApiResponse<UserDetailed>>(`user/${id}`, data);
  }
}

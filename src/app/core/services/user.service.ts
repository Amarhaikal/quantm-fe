import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  UserDetailed,
  UserMiniProfile,
  UserUpdateDto,
  UserInsightResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getMyProfile(): Observable<ApiResponse<UserMiniProfile>> {
    return this.api.get<ApiResponse<UserMiniProfile>>('users/mini-profile');
  }

  getUserById(id: number): Observable<ApiResponse<UserDetailed>> {
    return this.api.get<ApiResponse<UserDetailed>>(`users/${id}`);
  }

  getUserByUsername(username: string): Observable<ApiResponse<UserDetailed>> {
    return this.api.get<ApiResponse<UserDetailed>>(`users/username/${username}`);
  }

  updateUser(id: number, data: UserUpdateDto): Observable<ApiResponse<UserDetailed>> {
    return this.api.put<ApiResponse<UserDetailed>>(`users/${id}`, data);
  }

  updateProfilePhoto(id: number, data: FormData): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(`users/${id}/photo`, data);
  }

  deleteProfilePhoto(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`users/${id}/photo`);
  }

  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`users/${id}`);
  }

  getUsers(params: any): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('users', params);
  }

  checkUsernameAvailability(username: string): Observable<ApiResponse<{ available: boolean }>> {
    return this.api.get<ApiResponse<{ available: boolean }>>(`users/check-username/${username}`);
  }

  getUserInsight(id: number): Observable<UserInsightResponse> {
    return this.api.get<UserInsightResponse>(`users/${id}/insight`);
  }
}

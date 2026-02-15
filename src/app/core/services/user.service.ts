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

  updateProfilePhoto(id: number, data: FormData): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(`user/${id}/photo`, data);
  }

  deleteProfilePhoto(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`user/${id}/photo`);
  }

  checkUsernameAvailability(username: string): Observable<ApiResponse<{ available: boolean }>> {
    return this.api.get<ApiResponse<{ available: boolean }>>(`user/check-username/${username}`);
  }
}

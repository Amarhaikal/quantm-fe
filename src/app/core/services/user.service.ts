import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getMyProfile(): Observable<UserResponse> {
    return this.api.get<UserResponse>('user/mini-profile');
  }
}

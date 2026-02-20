import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { SessionActivity } from '../models/session-activity.model';

@Injectable({
  providedIn: 'root',
})
export class SessionActivityService {
  private api = inject(ApiService);

  getSessionActivities(params: any): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('auth/sessions', params);
  }

  endSession(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`auth/logout-session/${id}`);
  }
}

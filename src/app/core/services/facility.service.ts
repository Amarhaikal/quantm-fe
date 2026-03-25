import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  Facility,
  FacilityCreateDto,
  FacilityListResponse,
  FacilityResponse,
  FacilityUpdateDto,
} from '../models/facility.model';

@Injectable({ providedIn: 'root' })
export class FacilityService {
  private api = inject(ApiService);

  // ─── List ──────────────────────────────────────────────────────────────
  getFacilities(params?: any): Observable<FacilityListResponse> {
    return this.api.get<FacilityListResponse>('facilities', params);
  }

  // ─── Single ───────────────────────────────────────────────────────────
  getFacilityById(id: number): Observable<FacilityResponse> {
    return this.api.get<FacilityResponse>(`facilities/${id}`);
  }

  // ─── Create ──────────────────────────────────────────────────────────
  createFacility(data: FacilityCreateDto): Observable<FacilityResponse> {
    return this.api.post<FacilityResponse>('facility', data);
  }

  // Bulk create
  createFacilities(data: FacilityCreateDto[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('facilities/batch', data);
  }

  // ─── Update ──────────────────────────────────────────────────────────
  updateFacility(id: number, data: FacilityUpdateDto): Observable<FacilityResponse> {
    return this.api.put<FacilityResponse>(`facilities/${id}`, data);
  }

  // Bulk update
  updateFacilities(data: any[]): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>('facilities/batch', data);
  }

  // ─── Delete ──────────────────────────────────────────────────────────
  deleteFacility(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`facilities/${id}`);
  }

  // Bulk delete
  deleteFacilities(ids: (string | number)[]): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>('facilities/batch', { ids: ids.join(',') });
  }
}

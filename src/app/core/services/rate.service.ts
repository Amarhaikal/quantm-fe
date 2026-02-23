import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { RateCreateDto, RateListResponse, RateResponse, RateUpdateDto } from '../models/rate.model';

@Injectable({ providedIn: 'root' })
export class RateService {
  private api = inject(ApiService);

  // ── List ──────────────────────────────────────────────────────────────
  getRates(params?: any): Observable<RateListResponse> {
    return this.api.get<RateListResponse>('rate', params);
  }

  // ── Single ────────────────────────────────────────────────────────────
  getRateById(id: number): Observable<RateResponse> {
    return this.api.get<RateResponse>(`rate/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────
  createRate(data: RateCreateDto): Observable<RateResponse> {
    return this.api.post<RateResponse>('rate', data);
  }

  createRates(data: RateCreateDto[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('rate', data);
  }

  // ── Update ────────────────────────────────────────────────────────────
  updateRate(id: number, data: RateUpdateDto): Observable<RateResponse> {
    return this.api.put<RateResponse>(`rate/${id}`, data);
  }

  updateRates(data: any[]): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>('rate', data);
  }

  // ── Delete ────────────────────────────────────────────────────────────
  deleteRate(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`rate/${id}`);
  }

  deleteRates(ids: string[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('rate/delete', ids);
  }
}

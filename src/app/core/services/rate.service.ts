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
    return this.api.get<RateListResponse>('rates', params);
  }

  // ── Single ────────────────────────────────────────────────────────────
  getRateById(id: number): Observable<RateResponse> {
    return this.api.get<RateResponse>(`rates/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────
  createRate(data: RateCreateDto): Observable<RateResponse> {
    return this.api.post<RateResponse>('rates', data);
  }

  createRates(data: RateCreateDto[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('rates', data);
  }

  // ── Update ────────────────────────────────────────────────────────────
  updateRate(id: number, data: RateUpdateDto): Observable<RateResponse> {
    return this.api.put<RateResponse>(`rates/${id}`, data);
  }

  updateRates(data: any[]): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>('rates', data);
  }

  // ── Delete ────────────────────────────────────────────────────────────
  deleteRate(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`rates/${id}`);
  }

  deleteRates(ids: string[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('rates/delete', ids);
  }
}

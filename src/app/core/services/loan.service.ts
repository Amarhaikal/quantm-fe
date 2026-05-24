import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Loan, LoanCreateDto, LoanListResponse, LoanResponse, LoanUpdateDto } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private api = inject(ApiService);

  getLoans(params?: any): Observable<LoanListResponse> {
    return this.api.get<LoanListResponse>('loans', params);
  }

  getLoanById(id: number): Observable<LoanResponse> {
    return this.api.get<LoanResponse>(`loans/${id}`);
  }

  createLoan(data: LoanCreateDto): Observable<LoanResponse> {
    return this.api.post<LoanResponse>('loans', data);
  }

  updateLoan(id: number, data: LoanUpdateDto): Observable<LoanResponse> {
    return this.api.put<LoanResponse>(`loans/${id}`, data);
  }

  deleteLoan(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`loans/${id}`);
  }
}

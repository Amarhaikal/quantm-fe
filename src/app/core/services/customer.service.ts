import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  CustomerCreateDto,
  CustomerListResponse,
  CustomerResponse,
  CustomerUpdateDto,
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private api = inject(ApiService);

  getCustomers(params?: any): Observable<CustomerListResponse> {
    return this.api.get<CustomerListResponse>('customers', params);
  }

  getCustomerById(id: number): Observable<CustomerResponse> {
    return this.api.get<CustomerResponse>(`customers/${id}`);
  }

  createCustomer(data: CustomerCreateDto): Observable<CustomerResponse> {
    return this.api.post<CustomerResponse>('customers', data);
  }

  updateCustomer(id: number, data: CustomerUpdateDto): Observable<CustomerResponse> {
    return this.api.put<CustomerResponse>(`customers/${id}`, data);
  }

  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`customers/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  Product,
  ProductCreateDto,
  ProductListResponse,
  ProductResponse,
  ProductUpdateDto,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  // ─── List ──────────────────────────────────────────────────────────────
  getProducts(params?: any): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('products', params);
  }

  // ─── Single ───────────────────────────────────────────────────────────
  getProductById(id: number): Observable<ProductResponse> {
    return this.api.get<ProductResponse>(`products/${id}`);
  }

  // ─── Create ──────────────────────────────────────────────────────────
  createProduct(data: ProductCreateDto): Observable<ProductResponse> {
    return this.api.post<ProductResponse>('products', data);
  }

  // Bulk create
  createProducts(data: ProductCreateDto[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('products/batch', data);
  }

  // ─── Update ──────────────────────────────────────────────────────────
  updateProduct(id: number, data: ProductUpdateDto): Observable<ProductResponse> {
    return this.api.put<ProductResponse>(`products/${id}`, data);
  }

  // Bulk update
  updateProducts(data: any[]): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>('products/batch', data);
  }

  // ─── Delete ──────────────────────────────────────────────────────────
  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`products/${id}`);
  }

  // Bulk delete
  deleteProducts(ids: (string | number)[]): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>('products/batch', { ids: ids.join(',') });
  }
}

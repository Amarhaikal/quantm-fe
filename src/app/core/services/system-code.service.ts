import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import {
  CodeType,
  CodeTypeResponse,
  SystemCode,
  SystemCodeReference,
} from '../models/code-type.model';
import { CODE_TYPES, CodeTypeValue } from '../constants/code-types.constants';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class SystemCodeService {
  private api = inject(ApiService);

  // Signal to store all system codes (grouped by type)
  private systemCodesData = signal<CodeType[]>([]);

  // Loading state
  isLoading = signal<boolean>(false);

  // Expose system codes as readonly
  systemCodes = computed(() => this.systemCodesData());

  /**
   * Load all system codes from the API
   */
  loadSystemCodes() {
    this.isLoading.set(true);
    this.api.get<CodeTypeResponse>('system-codes/all').subscribe({
      next: (response) => {
        this.systemCodesData.set(response.result);
        this.isLoading.set(false);

        // Log all code types with their system codes
        const formattedData = response.result.reduce(
          (acc, codeType) => {
            acc[`${codeType.code} - ${codeType.description}`] = codeType.codes;
            return acc;
          },
          {} as Record<string, SystemCodeReference[]>,
        );

        console.log('=== System Codes Loaded ===');
        console.log(formattedData);
      },
      error: (error) => {
        console.error('Failed to load system codes:', error);
        this.isLoading.set(false);
      },
    });
  }

  getSystemCodeGroup(code: CodeTypeValue | string): CodeType | undefined {
    return this.systemCodesData().find((ct) => ct.code === code);
  }

  getSystemCodes(codeTypeCode: CodeTypeValue | string): SystemCodeReference[] {
    const group = this.getSystemCodeGroup(codeTypeCode);
    return group?.codes ?? [];
  }

  getSystemCode(
    codeTypeCode: CodeTypeValue | string,
    systemCode: string,
  ): SystemCodeReference | undefined {
    const systemCodes = this.getSystemCodes(codeTypeCode);
    return systemCodes.find((sc) => sc.code === systemCode);
  }

  getSystemCodeDescription(codeTypeCode: CodeTypeValue | string, systemCode: string): string {
    return this.getSystemCode(codeTypeCode, systemCode)?.description ?? '';
  }

  getSystemCodesList(params: any): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('system-codes', params);
  }

  createSystemCodes(data: any): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('system-codes', data);
  }

  updateSystemCodes(data: any): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(`system-codes`, data);
  }

  deleteSystemCodes(ids: (string | number)[]): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>('system-codes', { ids: ids.join(',') });
  }
}

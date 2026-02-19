import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { CodeType, CodeTypeResponse, SystemCode } from '../models/code-type.model';
import { CODE_TYPES, CodeTypeValue } from '../constants/code-types.constants';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class CodeTypeService {
  private api = inject(ApiService);

  // Signal to store all code types
  private codeTypesData = signal<CodeType[]>([]);

  // Loading state
  isLoading = signal<boolean>(false);

  // Expose code types as readonly
  codeTypes = computed(() => this.codeTypesData());

  /**
   * Load all code types from the API
   */
  loadCodeTypes() {
    this.isLoading.set(true);
    this.api.get<CodeTypeResponse>('parameter/codeType').subscribe({
      next: (response) => {
        this.codeTypesData.set(response.data);
        this.isLoading.set(false);

        // Log all code types with their system codes
        const formattedData = response.data.reduce(
          (acc, codeType) => {
            acc[`${codeType.code} - ${codeType.description}`] = codeType.system_codes;
            return acc;
          },
          {} as Record<string, SystemCode[]>,
        );

        console.log('=== Code Types and System Codes ===');
        console.log(formattedData);
      },
      error: (error) => {
        console.error('Failed to load code types:', error);
        this.isLoading.set(false);
      },
    });
  }

  getCodeType(code: CodeTypeValue | string): CodeType | undefined {
    return this.codeTypesData().find((ct) => ct.code === code);
  }

  getSystemCodes(codeTypeCode: CodeTypeValue | string): SystemCode[] {
    const codeType = this.getCodeType(codeTypeCode);
    return codeType?.system_codes ?? [];
  }

  getSystemCode(codeTypeCode: CodeTypeValue | string, systemCode: string): SystemCode | undefined {
    const systemCodes = this.getSystemCodes(codeTypeCode);
    return systemCodes.find((sc) => sc.code === systemCode);
  }

  getSystemCodeDescription(codeTypeCode: CodeTypeValue | string, systemCode: string): string {
    return this.getSystemCode(codeTypeCode, systemCode)?.description ?? '';
  }

  getSystemCodesList(params: any): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('parameter/systemCode', params);
  }

  createSystemCode(data: any): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('parameter/systemCode', data);
  }

  createSystemCodes(data: any): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('parameter/systemCodes', data);
  }

  updateSystemCode(id: string, data: any): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(`parameter/systemCode/${id}`, data);
  }

  updateSystemCodes(data: any): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>(`parameter/systemCodes`, data);
  }

  deleteSystemCode(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`parameter/systemCode/${id}`);
  }

  deleteSystemCodes(ids: string[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`parameter/systemCodes/delete`, ids);
  }
}

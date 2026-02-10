import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { CodeType, CodeTypeResponse, SystemCode } from '../models/code-type.model';

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

  /**
   * Get a specific code type by its code (e.g., 'CTRY', 'STT', 'GNDR')
   * @param code The code type code
   * @returns The code type object or undefined
   */
  getCodeType(code: string): CodeType | undefined {
    return this.codeTypesData().find((ct) => ct.code === code);
  }

  /**
   * Get system codes for a specific code type
   * @param codeTypeCode The code type code (e.g., 'CTRY', 'STT')
   * @returns Array of system codes or empty array
   */
  getSystemCodes(codeTypeCode: string): SystemCode[] {
    const codeType = this.getCodeType(codeTypeCode);
    return codeType?.system_codes ?? [];
  }

  /**
   * Get a specific system code by code type and system code
   * @param codeTypeCode The code type code (e.g., 'CTRY')
   * @param systemCode The system code (e.g., 'MY', 'ID')
   * @returns The system code object or undefined
   */
  getSystemCode(codeTypeCode: string, systemCode: string): SystemCode | undefined {
    const systemCodes = this.getSystemCodes(codeTypeCode);
    return systemCodes.find((sc) => sc.code === systemCode);
  }

  /**
   * Get the description of a system code
   * @param codeTypeCode The code type code (e.g., 'CTRY')
   * @param systemCode The system code (e.g., 'MY')
   * @returns The description or empty string
   */
  getSystemCodeDescription(codeTypeCode: string, systemCode: string): string {
    return this.getSystemCode(codeTypeCode, systemCode)?.description ?? '';
  }
}

import { Injectable, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private datePipe = inject(DatePipe);

  /**
   * Formats a date string for audit fields (created_at, updated_at).
   * Strips 'Z' suffix to avoid unintended timezone shifts and applies 'dd/MM/yyyy HH:mm:ss' format.
   * @param date The date string to format
   * @returns Formatted date string or empty string if input is null/undefined
   */
  formatAuditDate(date: string | null | undefined): string {
    if (!date) return '';
    // Strip 'Z' to treat the time as local/absolute and avoid conversion offsets
    const cleanDate = typeof date === 'string' ? date.replace('Z', '') : date;
    return this.datePipe.transform(cleanDate, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  /**
   * Formats a date string to a standard display format.
   * @param date The date to format
   * @param format The display format (default: 'dd/MM/yyyy')
   * @returns Formatted date string
   */
  formatDisplayDate(date: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string {
    if (!date) return '';
    return this.datePipe.transform(date, format) || '';
  }
}

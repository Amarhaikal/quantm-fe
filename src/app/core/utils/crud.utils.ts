import { ApiResponse } from '../models/api.model';

export class CrudUtils {
  static filterApiParams(params: any): any {
    if (!params) return {};
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''),
    );
  }

  static getStatusSeverity(code: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (code) {
      case 'A':
      case 'ACTIVE':
        return 'success';
      case 'N':
      case 'NEW':
        return 'info';
      case 'D':
      case 'DELETED':
      case 'DISABLED':
        return 'danger';
      case 'I':
      case 'INACTIVE':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}

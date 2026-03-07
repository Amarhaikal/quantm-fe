import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface Customer {
  id: number;
  fullname: string;
  reg_no: string;
  customer_type: SystemCodeReference;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CustomerCreateDto {
  fullname: string;
  reg_no: string;
  customer_type: { code: string };
}

export interface CustomerUpdateDto {
  fullname?: string;
  reg_no?: string;
  customer_type?: { code: string };
}

export type CustomerResponse = ApiResponse<Customer>;
export type CustomerListResponse = ApiResponse<{ data: Customer[]; total_count: number }>;

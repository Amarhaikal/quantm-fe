import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface Customer {
  id: number;
  fullname: string;
  reg_no: string;
  customer_no: string;
  customer_type: SystemCodeReference;
  profile_photo?: string | null;
  email?: string;
  phone_no?: string;
  company_type?: SystemCodeReference;
  department?: SystemCodeReference;
  start_operation_date?: string;
  no_of_employees?: number;
  last_revenue_reported?: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CustomerCreateDto {
  fullname: string;
  reg_no: string;
  customer_type: { code: string };
  email?: string;
  phone_no?: string;
  company_type?: { code: string };
  department?: { code: string };
  start_operation_date?: string;
  no_of_employees?: number;
  last_revenue_reported?: number;
}

export interface CustomerUpdateDto {
  fullname?: string;
  reg_no?: string;
  customer_type?: { code: string };
  email?: string;
  phone_no?: string;
  company_type?: { code: string };
  department?: { code: string };
  start_operation_date?: string;
  no_of_employees?: number;
  last_revenue_reported?: number;
}

export type CustomerResponse = ApiResponse<Customer>;
export type CustomerListResponse = ApiResponse<{ data: Customer[]; total_count: number }>;

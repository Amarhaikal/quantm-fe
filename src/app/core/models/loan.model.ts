import { ApiResponse } from './api.model';
import { Customer } from './customer.model';
import { Product } from './product.model';
import { Rate } from './rate.model';
import { SystemCodeReference } from './code-type.model';

export interface Loan {
  id: number;
  loan_number: string;
  customer: Customer;
  product: Product;
  rate: Rate;
  principal_amount: number;
  outstanding_balance: number;
  loan_status: SystemCodeReference;
  assigned_to: string;
  can_edit: boolean;
  can_submit: boolean;
  can_approve: boolean;
  can_reject: boolean;
  tenure: number;
  frequency: SystemCodeReference;
  start_date: string;
  end_date: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface LoanCreateDto {
  customer_id: number;
  product: {
    code: string;
  };
  rate: {
    code: string;
  };
  principal_amount: number;
  tenure: number;
  frequency: {
    code: string;
  };
  start_date: string;
  end_date: string;
  loan_status: {
    code: string;
  };
}

export interface LoanUpdateDto extends Partial<LoanCreateDto> {}

export type LoanResponse = ApiResponse<Loan>;
export type LoanListResponse = ApiResponse<{ data: Loan[]; total_count: number }>;

import { ApiResponse } from './api.model';
import { Facility } from './facility.model';

export interface Product {
  id: number;
  code: string;
  description: string;
  facility: {
    code: string;
    description: string;
    asset_type: {
      code: string;
      description: string;
    };
  };
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface ProductCreateDto {
  code: string;
  description: string;
  facility: { code: string };
}

export interface ProductUpdateDto {
  code?: string;
  description?: string;
  facility?: { code: string };
}

export type ProductResponse = ApiResponse<Product>;
export type ProductListResponse = ApiResponse<{ data: Product[]; total_count: number }>;

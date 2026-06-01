import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface Rate {
  id: number;
  code: string;
  description: string;
  rate: number;
  rateType: SystemCodeReference;
  createdBy: number | null;
  creatorName: string | null;
  createdAt: string;
  updatedBy: number | null;
  updaterName: string | null;
  updatedAt: string | null;
}

export interface RateCreateDto {
  code: string;
  description: string;
  rate: number;
  rateTypeCode: string;
}

export interface RateUpdateDto {
  code?: string;
  description?: string;
  rate?: number;
  rateTypeCode?: string;
}

export type RateResponse = ApiResponse<Rate>;
export type RateListResponse = ApiResponse<{
  data: Rate[];
  total_count: number;
  page_no: number;
  page_size: number;
  total_pages: number;
}>;

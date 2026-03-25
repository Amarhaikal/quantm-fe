import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface Facility {
  id: number;
  code: string;
  description: string;
  facility_type: SystemCodeReference;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface FacilityCreateDto {
  code: string;
  description: string;
  facility_type: { code: string };
}

export interface FacilityUpdateDto {
  code?: string;
  description?: string;
  facility_type?: { code: string };
}

export type FacilityResponse = ApiResponse<Facility>;
export type FacilityListResponse = ApiResponse<{ data: Facility[]; total_count: number }>;

import { ApiResponse } from './api.model';

export interface SystemCode {
  id: number;
  code: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface SystemCodeReference {
  code: string;
  description: string;
}

export interface CodeType {
  code: string;
  description: string;
  codes: SystemCodeReference[];
}

export type CodeTypeResponse = ApiResponse<CodeType[]>;

export interface SystemCode {
  id: number;
  code: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CodeType {
  id: number;
  code: string;
  description: string;
  system_codes: SystemCode[];
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CodeTypeResponse {
  status: number;
  message: string;
  data: CodeType[];
}

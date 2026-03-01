import { ApiResponse } from './api.model';

export interface SessionActivity {
  id: number;
  session_duration: number;
  created_at: string;
  expires_at: string;
  logged_out_at: string | null;
  is_active: boolean;
  ip_address: string;
  device_type: string;
  location: string | null;
  last_activity_at: string | null;
  logout_reason: string | null;
  user: {
    id: number;
    fullname: string;
    username: string;
    role: {
      code: string;
      description: string;
      profile_photo: string;
    };
  };
}

export type SessionActivityResponse = ApiResponse<SessionActivity[]>;

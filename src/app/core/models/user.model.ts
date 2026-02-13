import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface UserMiniProfile {
  fullname: string;
  username: string;
  shortname: string;
  profile_image_url: string;
}

export interface UserDetailed {
  id: number;
  fullname: string;
  username: string;
  staff_id: string;
  shortname: string;
  profile_image_url: string;
  email: string;
  phone_no: string;
  gender: SystemCodeReference;
  role: SystemCodeReference;
  status: SystemCodeReference;
  id_no?: string;
  address: {
    address_line_1: string;
    address_line_2: string;
    city: string;
    postcode: string;
    state: SystemCodeReference;
    country: SystemCodeReference;
  };
  joined_dt: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
}

export type UserMiniProfileResponse = ApiResponse<UserMiniProfile>;
export type UserResponse = ApiResponse<UserDetailed>;

export interface UserUpdateDto {
  fullname?: string;
  shortname?: string;
  staff_id?: string;
  gender?: { code: string };
  role?: { code: string };
  status?: { code: string };
  id_no?: string;
  phone_no?: string;
  email?: string;
  joined_dt?: string;
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    postcode?: string;
    state?: { code: string };
    country?: { code: string };
  };
}

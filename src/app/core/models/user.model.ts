import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface UserMiniProfile {
  fullname: string;
  username: string;
  shortname: string;
  profile_photo: string | null;
}

export interface UserDetailed {
  id: number;
  fullname: string;
  username: string;
  staff_no: string;
  shortname: string;
  profile_photo: string | null;
  email: string;
  phone_no: string;
  gender: SystemCodeReference;
  role: SystemCodeReference;
  status: SystemCodeReference;
  id_no?: string;
  joined_dt: string;
  department: SystemCodeReference;
  designation: string;
  remarks: string;
  address: {
    address_line1: string;
    address_line2: string;
    city: string;
    postcode: string;
    state: SystemCodeReference;
    country: SystemCodeReference;
  };
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
}

export type UserMiniProfileResponse = ApiResponse<UserMiniProfile>;
export type UserResponse = ApiResponse<UserDetailed>;

export type UserInsightResponse = ApiResponse<string>;

export interface UserUpdateDto {
  fullname?: string;
  shortname?: string;
  staff_no?: string;
  gender?: { code: string };
  role?: { code: string };
  status?: { code: string };
  id_no?: string;
  phone_no?: string;
  email?: string;
  joined_dt?: string;
  department?: { code: string };
  designation?: string;
  s?: string;
  address?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postcode?: string;
    state?: { code: string };
    country?: { code: string };
  };
}

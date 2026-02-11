import { SystemCodeReference } from './code-type.model';

export interface UserMiniProfileResponse {
  status: number;
  message: string;
  data: {
    fullname: string;
    username: string;
    profile_image_url: string;
  };
}
export interface UserResponse {
  status: number;
  message: string;
  data: {
    id: number;
    fullname: string;
    username: string;
    shortname: string;
    profile_image_url: string;
    email: string;
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
  };
}

export interface UserUpdateDto {
  fullname?: string;
  gender?: { code: string };
  role?: { code: string };
  status?: { code: string };
  id_no?: string;
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

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
    fullname: string;
    username: string;
    profile_image_url: string;
    role: SystemCodeReference;
    id_no?: string;
    address: {
      address_line_1: string;
      address_line_2: string;
      city: string;
      postcode: string;
      state: SystemCodeReference;
      country: SystemCodeReference;
    };
  };
}

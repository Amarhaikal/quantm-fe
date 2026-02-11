import { ApiResponse } from './api.model';
import { UserDetailed } from './user.model';

export interface Role {
  id: number;
  code: string;
  description: string;
}

// export interface User {
//   id: number;
//   fullname: string;
//   shortname: string;
//   id_no: string;
//   username: string;
//   email: string;
//   role: Role;
//   profile_image_url?: string;
// }

export type AuthResponse = ApiResponse<{
  user: UserDetailed;
}>;

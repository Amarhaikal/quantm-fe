export interface Role {
  id: number;
  code: string;
  description: string;
}

export interface User {
  id: number;
  fullname: string;
  id_no: string;
  username: string;
  email: string;
  role: Role;
  profile_image_url?: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    user: User;
  };
}

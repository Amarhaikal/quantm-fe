export interface UserResponse {
  status: number;
  message: string;
  data: {
    name: string;
    username: string;
  };
}

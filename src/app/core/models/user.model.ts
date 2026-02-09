export interface UserResponse {
  status: number;
  message: string;
  data: {
    fullname: string;
    username: string;
    profile_image_url: string;
  };
}

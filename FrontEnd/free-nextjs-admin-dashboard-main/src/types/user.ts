export interface UserProfile {
  id: number;
  name: string;
  email: string;
  profileImagePath: string | null;
  roleId: number;
  roleName: string;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
  confirmNewPassword?: string;
  profileImage?: File | null;
}

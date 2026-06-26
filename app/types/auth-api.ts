import type { ApiResponse } from '~/types/user-api';

export type AuthUser = {
  id: number;
  name: string;
  discordId: string;
  avatar: string;
  description: string;
  role: number;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  user: AuthUser | null;
};

export type LoginResponse = {
  user: AuthUser;
};

export type MeApiResponse = ApiResponse<MeResponse>;
export type LoginApiResponse = ApiResponse<LoginResponse>;

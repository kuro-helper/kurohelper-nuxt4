import type { ApiResponse } from './user-api';

export type AnnouncementItem = {
  id: number;
  category: string;
  title: string;
  content: string;
  /** 網頁板小 icon（MDI 名稱，如 mdi-bullhorn） */
  icon?: string | null;
  thumbnail?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnnouncementBody = {
  category: string;
  title: string;
  content: string;
  icon?: string | null;
  thumbnail?: string | null;
  image?: string | null;
};

export type AnnouncementListResponse = ApiResponse<AnnouncementItem[]>;
export type CreateAnnouncementResponse = ApiResponse<AnnouncementItem>;

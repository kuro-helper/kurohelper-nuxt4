import { defineEventHandler } from 'h3';
import type { AnnouncementItem, CreateAnnouncementBody } from '../../app/types/announcement-api';
import type { ApiResponse } from '../../app/types/user-api';
import { readJsonBody } from '../utils/readJsonBody';
import { postUpstreamApi } from '../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<AnnouncementItem | null>> => {
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return postUpstreamApi<ApiResponse<AnnouncementItem>>(
    '/api/announcement',
    parsed.value as CreateAnnouncementBody,
    event,
  );
});

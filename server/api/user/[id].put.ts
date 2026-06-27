import { defineEventHandler, getRouterParam } from 'h3';
import type { ApiResponse, UserProfileDto } from '../../../app/types/user-api';
import { readJsonBody } from '../../utils/readJsonBody';
import { putUpstreamApi } from '../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<UserProfileDto | null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return putUpstreamApi<ApiResponse<UserProfileDto>>(
    `/api/user/${encodeURIComponent(id)}`,
    parsed.value,
    event,
  );
});

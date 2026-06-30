import { defineEventHandler, getRouterParam } from 'h3';
import type { ApiResponse, UserGameDto } from '../../../../app/types/user-api';
import { readJsonBody } from '../../../utils/readJsonBody';
import { postUpstreamApi } from '../../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<UserGameDto | null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return postUpstreamApi<ApiResponse<UserGameDto>>(
    `/api/user/${encodeURIComponent(id)}/game`,
    parsed.value,
    event,
  );
});

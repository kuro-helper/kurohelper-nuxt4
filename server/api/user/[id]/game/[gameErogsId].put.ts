import { defineEventHandler, getRouterParam } from 'h3';
import type { ApiResponse, UserGameDto } from '../../../../../app/types/user-api';
import { readJsonBody } from '../../../../utils/readJsonBody';
import { putUpstreamApi } from '../../../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<UserGameDto | null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  const gameErogsId = String(getRouterParam(event, 'gameErogsId') ?? '').trim();
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return putUpstreamApi<ApiResponse<UserGameDto>>(
    `/api/user/${encodeURIComponent(id)}/game/${encodeURIComponent(gameErogsId)}`,
    parsed.value,
    event,
  );
});

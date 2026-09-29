import { defineEventHandler, getRouterParam } from 'h3';
import type { GameItem, UpdateGameBody } from '../../../../app/types/kurohelper-api';
import type { ApiResponse } from '../../../../app/types/user-api';
import { readJsonBody } from '../../../utils/readJsonBody';
import { putUpstreamApi } from '../../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<GameItem | null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return putUpstreamApi<ApiResponse<GameItem>>(
    `/api/kurohelper/game/${encodeURIComponent(id)}`,
    parsed.value as UpdateGameBody,
    event,
  );
});

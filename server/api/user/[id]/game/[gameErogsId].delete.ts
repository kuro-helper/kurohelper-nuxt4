import { defineEventHandler, getRouterParam } from 'h3';
import type { ApiResponse } from '../../../../../app/types/user-api';
import { deleteUpstreamApi } from '../../../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  const gameErogsId = String(getRouterParam(event, 'gameErogsId') ?? '').trim();
  return deleteUpstreamApi<ApiResponse<null>>(
    `/api/user/${encodeURIComponent(id)}/game/${encodeURIComponent(gameErogsId)}`,
    event,
  );
});

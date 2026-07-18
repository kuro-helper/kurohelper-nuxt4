import { defineEventHandler, getRouterParam } from 'h3';
import type { ApiResponse } from '../../../app/types/user-api';
import { deleteUpstreamApi } from '../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  const id = String(getRouterParam(event, 'id') ?? '').trim();
  return deleteUpstreamApi<ApiResponse<null>>(`/api/announcement/${encodeURIComponent(id)}`, event);
});

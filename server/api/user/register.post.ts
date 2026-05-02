import { defineEventHandler } from 'h3';
import type { ApiResponse } from '../../../app/types/user-api';
import { readJsonBody } from '../../utils/readJsonBody';
import { postUpstreamApi } from '../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<unknown>> => {
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return postUpstreamApi<ApiResponse<unknown>>('/api/user/register', parsed.value);
});

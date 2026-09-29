import { defineEventHandler } from 'h3';
import type { EnsureGameBody, GameItem } from '../../../../app/types/kurohelper-api';
import type { ApiResponse } from '../../../../app/types/user-api';
import { readJsonBody } from '../../../utils/readJsonBody';
import { postUpstreamApi } from '../../../utils/upstreamApi';

export default defineEventHandler(async (event): Promise<ApiResponse<GameItem | null>> => {
  const parsed = await readJsonBody(event);
  if (!parsed.ok) return { message: parsed.message, data: null };
  return postUpstreamApi<ApiResponse<GameItem>>(
    '/api/kurohelper/game/ensure',
    parsed.value as EnsureGameBody,
    event,
  );
});

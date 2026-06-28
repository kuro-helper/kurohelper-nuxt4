import { defineEventHandler } from 'h3';
import type { ApiResponse } from '../../../app/types/user-api';
import { postUpstreamApi } from '../../utils/upstreamApi';

export default defineEventHandler(
  (event): Promise<ApiResponse<null>> =>
    postUpstreamApi<ApiResponse<null>>('/api/auth/logout', {}, event),
);

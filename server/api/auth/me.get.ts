import { defineEventHandler } from 'h3';
import type { MeApiResponse } from '../../../app/types/auth-api';
import { fetchUpstreamApi } from '../../utils/upstreamApi';

export default defineEventHandler(
  (event): Promise<MeApiResponse> => fetchUpstreamApi<MeApiResponse>('/api/auth/me', {}, event),
);

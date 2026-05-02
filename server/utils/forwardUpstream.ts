import { defineEventHandler, getQuery, getRouterParam } from 'h3';

import { fetchUpstreamApi } from './upstreamApi';

export const forwardGet = <T>(upstreamPath: string) =>
  defineEventHandler((event): Promise<T> => fetchUpstreamApi<T>(upstreamPath, getQuery(event)));

export const forwardRegisterLookup = <T>(upstreamPath: string) =>
  defineEventHandler(
    (event): Promise<T> =>
      fetchUpstreamApi<T>(upstreamPath, {
        register_id: String(getRouterParam(event, 'id') ?? '').trim(),
      }),
  );

import { createError } from 'h3';
import { consola } from 'consola';
import { useRuntimeConfig } from 'nitropack/runtime/internal/config';
import { $fetch } from 'ofetch';
import type { QueryObject, QueryValue } from 'ufo';

type UpstreamFetchError = {
  statusCode?: number;
  status?: number;
  data?: unknown;
  message?: string;
};

const pickMessage = (data: unknown, err: unknown): string => {
  for (const o of [data, err]) {
    if (o && typeof o === 'object' && 'message' in o) {
      const m = (o as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
  }
  return '';
};

const normalizeScalar = (value: QueryValue): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return undefined;
  if (typeof value === 'object') return undefined;
  return String(value);
};

const normalizeQuery = (query: QueryObject) => {
  const normalized: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const items = value
        .map((item) => normalizeScalar(item))
        .filter((item): item is string => typeof item === 'string' && item.length > 0);
      if (items.length > 0) normalized[key] = items;
      continue;
    }
    if (typeof value === 'object') continue;
    const scalar = normalizeScalar(value);
    if (scalar !== undefined) normalized[key] = scalar;
  }
  return normalized;
};

const getUpstreamAuth = () => {
  const config = useRuntimeConfig();
  const baseURL = String(config.apiBaseUrl || '').replace(/\/+$/, '');
  const token = String(config.apiToken || '').trim();

  if (!baseURL) {
    throw createError({ statusCode: 500, message: 'Missing API_BASE_URL configuration' });
  }
  if (!token) {
    throw createError({ statusCode: 500, message: 'Missing API_TOKEN configuration' });
  }
  return { baseURL, token };
};

const throwUpstreamError = (path: string, err: unknown): never => {
  const e = err as UpstreamFetchError;
  const statusCode = e.statusCode ?? e.status ?? 502;
  const data = e.data;
  const detail = pickMessage(data, err) || '(no message)';
  consola.warn(`[BFF] ${path}`, `${statusCode}: ${detail}`);

  const message = pickMessage(data, err);
  throw createError({
    statusCode,
    ...(data !== undefined ? { data } : {}),
    ...(message ? { message } : {}),
  });
};

const callUpstream = async <T>(opts: {
  path: string;
  method: 'GET' | 'POST';
  query?: QueryObject;
  body?: unknown;
}): Promise<T> => {
  const { baseURL, token } = getUpstreamAuth();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (opts.method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    return (await $fetch(opts.path, {
      baseURL,
      method: opts.method,
      headers,
      retry: 0,
      ...(opts.method === 'GET'
        ? { query: normalizeQuery(opts.query ?? {}) }
        : { body: opts.body as Record<string, unknown> }),
    })) as T;
  } catch (err) {
    return throwUpstreamError(opts.path, err);
  }
};

/** GET：query 轉發 kurohelper-api（路徑如 `/api/user`） */
export const fetchUpstreamApi = <T>(path: string, query: QueryObject): Promise<T> =>
  callUpstream<T>({ path, method: 'GET', query });

/** POST：body 已為物件，由 $fetch 序列化 JSON */
export const postUpstreamApi = <T>(path: string, body: unknown): Promise<T> =>
  callUpstream<T>({ path, method: 'POST', body });

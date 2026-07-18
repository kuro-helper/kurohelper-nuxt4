import { appendResponseHeader, createError, getRequestHeader, type H3Event } from 'h3';
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
    consola.error('[BFF] Missing API_BASE_URL configuration');
    throw createError({ statusCode: 500 });
  }
  if (!token) {
    consola.error('[BFF] Missing API_TOKEN configuration');
    throw createError({ statusCode: 500 });
  }
  return { baseURL, token };
};

const forwardSetCookies = (event: H3Event, headers: Headers) => {
  if (typeof headers.getSetCookie === 'function') {
    for (const cookie of headers.getSetCookie()) {
      appendResponseHeader(event, 'set-cookie', cookie);
    }
    return;
  }
  const raw = headers.get('set-cookie');
  if (raw) appendResponseHeader(event, 'set-cookie', raw);
};

const throwUpstreamError = (path: string, err: unknown): never => {
  const e = err as UpstreamFetchError;
  const statusCode = e.statusCode ?? e.status ?? 502;
  const message = pickMessage(e.data, err);
  consola.error(`[BFF] ${path}`, statusCode, message || '(no message)', e.data ?? err);

  throw createError({
    statusCode,
    message: message || undefined,
    data: e.data,
  });
};

const callUpstream = async <T>(opts: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: QueryObject;
  body?: unknown;
  event?: H3Event;
}): Promise<T> => {
  const { baseURL, token } = getUpstreamAuth();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (opts.method === 'POST' || opts.method === 'PUT') headers['Content-Type'] = 'application/json';
  if (opts.event) {
    const cookie = getRequestHeader(opts.event, 'cookie');
    if (cookie) headers.Cookie = cookie;
  }

  try {
    if (opts.event) {
      const res = await $fetch.raw(opts.path, {
        baseURL,
        method: opts.method,
        headers,
        retry: 0,
        ...(opts.method === 'GET'
          ? { query: normalizeQuery(opts.query ?? {}) }
          : opts.method === 'DELETE'
            ? {}
            : { body: opts.body as Record<string, unknown> }),
      });
      forwardSetCookies(opts.event, res.headers);
      return res._data as T;
    }

    return (await $fetch(opts.path, {
      baseURL,
      method: opts.method,
      headers,
      retry: 0,
      ...(opts.method === 'GET'
        ? { query: normalizeQuery(opts.query ?? {}) }
        : opts.method === 'DELETE'
          ? {}
          : { body: opts.body as Record<string, unknown> }),
    })) as T;
  } catch (err) {
    return throwUpstreamError(opts.path, err);
  }
};

/** GET：query 轉發 kurohelper-api。傳 event 時會轉發 Cookie / Set-Cookie（登入 session 用）。 */
export const fetchUpstreamApi = <T>(
  path: string,
  query: QueryObject,
  event?: H3Event,
): Promise<T> => callUpstream<T>({ path, method: 'GET', query, event });

/** POST：body 轉發 kurohelper-api。傳 event 時會轉發 Cookie / Set-Cookie（登入 session 用）。 */
export const postUpstreamApi = <T>(path: string, body: unknown, event?: H3Event): Promise<T> =>
  callUpstream<T>({ path, method: 'POST', body, event });

/** PUT：body 轉發 kurohelper-api。傳 event 時會轉發 Cookie / Set-Cookie（登入 session 用）。 */
export const putUpstreamApi = <T>(path: string, body: unknown, event?: H3Event): Promise<T> =>
  callUpstream<T>({ path, method: 'PUT', body, event });

/** DELETE：轉發 kurohelper-api。傳 event 時會轉發 Cookie / Set-Cookie（登入 session 用）。 */
export const deleteUpstreamApi = <T>(path: string, event?: H3Event): Promise<T> =>
  callUpstream<T>({ path, method: 'DELETE', event });

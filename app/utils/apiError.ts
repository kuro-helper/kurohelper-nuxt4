import type { FetchErrorLike } from '~/types/user-api';

export const logApiError = (err: unknown) => {
  const e = err as FetchErrorLike;
  console.error('[API]', e.status ?? e.statusCode ?? 500, e.data ?? e);
};

export const apiErrorUserMessage = (err: unknown) => {
  const status = (err as FetchErrorLike).status ?? (err as FetchErrorLike).statusCode ?? 500;
  return status === 404 ? '找不到頁面。' : '請稍後再試。';
};

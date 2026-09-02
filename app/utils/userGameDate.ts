/** 遊戲開始／結束日期：只取日曆日 YYYY-MM-DD */
export function parseUserGameDate(input?: string | null) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(input?.trim() ?? '');
  return match?.[1] ?? null;
}

/** 寫入 API 時固定為 UTC 午夜 */
export function toUserGameDatePayload(input?: string | null) {
  const date = parseUserGameDate(input);
  return date ? `${date}T00:00:00Z` : null;
}

export function formatUserGameDate(input?: string | null) {
  if (!input || input === '—') return '—';
  const date = parseUserGameDate(input);
  return date ? date.replaceAll('-', '/') : input.trim();
}

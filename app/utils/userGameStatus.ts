/** 與 kurohelper-api dto.UserGameStatus* 對齊 */
export const USER_GAME_STATUS = {
  NONE: 0,
  FINISHED: 1,
  PLAYING: 2,
  STALLED: 3,
  DROPPED: 4,
} as const;

export type UserGameStatus = (typeof USER_GAME_STATUS)[keyof typeof USER_GAME_STATUS];

export const USER_GAME_STATUS_LABELS: Record<UserGameStatus, string> = {
  [USER_GAME_STATUS.NONE]: '沒有狀態',
  [USER_GAME_STATUS.FINISHED]: '遊玩完畢',
  [USER_GAME_STATUS.PLAYING]: '遊玩中',
  [USER_GAME_STATUS.STALLED]: '暫停遊玩',
  [USER_GAME_STATUS.DROPPED]: '放棄遊玩',
};

/** v-select 用的 { value, label } 選項 */
export const USER_GAME_STATUS_OPTIONS = (
  [
    USER_GAME_STATUS.NONE,
    USER_GAME_STATUS.FINISHED,
    USER_GAME_STATUS.PLAYING,
    USER_GAME_STATUS.STALLED,
    USER_GAME_STATUS.DROPPED,
  ] as const
).map((value) => ({ value, label: USER_GAME_STATUS_LABELS[value] }));

export function userGameStatusLabel(status: number): string {
  return USER_GAME_STATUS_LABELS[status as UserGameStatus] ?? `未知(${status})`;
}

export function userGameStatusColor(status: number): string | undefined {
  switch (status) {
    case USER_GAME_STATUS.FINISHED:
      return 'success';
    case USER_GAME_STATUS.PLAYING:
      return 'secondary';
    case USER_GAME_STATUS.STALLED:
      return 'warning';
    case USER_GAME_STATUS.DROPPED:
      return 'error';
    default:
      return undefined;
  }
}

export function userGameStatusThemeStyle(status: number): Record<string, string> | undefined {
  const color = userGameStatusColor(status);
  if (!color) return undefined;
  return { '--status-rgb': `var(--v-theme-${color})` };
}

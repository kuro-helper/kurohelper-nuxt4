// 對應 kurohelper-batch/erogs_game.json 內實際出現的 category（共 33 種）
const CATEGORY_CHIP_COLORS: Record<string, string> = {
  '3DS': 'success',
  Android: 'warning',
  BROWSER: 'primary',
  DC: 'primary',
  FC: 'primary',
  'GBA(GB)': 'success',
  MCD: 'primary',
  MOBILE: 'warning',
  NDS: 'success',
  NGP: 'primary',
  NS: 'success',
  NS2: 'success',
  PC: 'info',
  'PC-FX': 'info',
  PCE: 'primary',
  PS: 'secondary',
  PS2: 'secondary',
  PS3: 'secondary',
  PS4: 'secondary',
  PS5: 'secondary',
  PSP: 'secondary',
  PSV: 'secondary',
  SFC: 'primary',
  SS: 'primary',
  WS: 'primary',
  Wii: 'success',
  'Wii U': 'success',
  XB: 'error',
  XB360: 'error',
  XBO: 'error',
  XSX: 'error',
  iOS: 'warning',
  iPhone: 'warning',
};

export function erogsGameCategoryChipColor(category: string): string {
  const label = category.trim();
  if (!label) return 'default';
  return CATEGORY_CHIP_COLORS[label] ?? 'primary';
}

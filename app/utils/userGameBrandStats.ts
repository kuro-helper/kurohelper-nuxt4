import type { UserGameDto } from '~/types/user-api';
import { parseUserGameDate } from '~/utils/userGameDate';
import { USER_GAME_STATUS } from '~/utils/userGameStatus';

export type BrandStatItem = {
  name: string;
  value: number;
  brandErogsId: number | null;
};

export type BrandStatsResult = {
  items: BrandStatItem[];
  total: number;
  brandCount: number;
};

const UNKNOWN_BRAND_NAME = '未知品牌';
export const MAX_BRAND_CHART_ITEMS = 10;

export function isFinishedInMonth(
  finishedDate: string | null | undefined,
  year: number,
  month: number,
): boolean {
  const dateOnly = parseUserGameDate(finishedDate);
  if (!dateOnly) return false;
  const [y, m] = dateOnly.split('-').map(Number);
  return y === year && m === month;
}

function brandKey(ug: UserGameDto): string {
  const id = ug.gameErogs?.brandErogsId;
  return id != null ? String(id) : 'unknown';
}

function brandName(ug: UserGameDto): string {
  return ug.gameErogs?.brandErogs?.name?.trim() || UNKNOWN_BRAND_NAME;
}

export function aggregateBrandStats(
  games: UserGameDto[],
  year: number,
  month: number,
  options?: { maxItems?: number },
): BrandStatsResult {
  const maxItems = options?.maxItems ?? MAX_BRAND_CHART_ITEMS;
  const counts = new Map<string, { name: string; value: number; brandErogsId: number | null }>();

  for (const ug of games) {
    if (ug.status !== USER_GAME_STATUS.FINISHED) continue;
    if (!isFinishedInMonth(ug.finishedDate, year, month)) continue;

    const key = brandKey(ug);
    const existing = counts.get(key);
    if (existing) {
      existing.value += 1;
      continue;
    }

    counts.set(key, {
      name: brandName(ug),
      value: 1,
      brandErogsId: ug.gameErogs?.brandErogsId ?? null,
    });
  }

  const sorted = [...counts.values()].sort((a, b) => b.value - a.value);
  const brandCount = sorted.length;
  const total = sorted.reduce((sum, item) => sum + item.value, 0);

  if (sorted.length <= maxItems) {
    return { items: sorted, total, brandCount };
  }

  const top = sorted.slice(0, maxItems - 1);
  const rest = sorted.slice(maxItems - 1);
  const restBrandCount = rest.length;
  const restTotal = rest.reduce((sum, item) => sum + item.value, 0);

  return {
    items: [
      ...top,
      {
        name: `其他（${restBrandCount} 個品牌）`,
        value: restTotal,
        brandErogsId: null,
      },
    ],
    total,
    brandCount,
  };
}

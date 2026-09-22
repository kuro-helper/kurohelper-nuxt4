import type { UserGameDto } from '~/types/user-api';
import { parseUserGameDate } from '~/utils/userGameDate';
import { USER_GAME_STATUS } from '~/utils/userGameStatus';

export type BrandStatGame = {
  name: string;
  brandName: string;
  finishedDate: string | null;
};

export type BrandStatItem = {
  name: string;
  value: number;
  brandErogsId: number | null;
  games: BrandStatGame[];
  isOthers?: boolean;
};

export type BrandStatsResult = {
  items: BrandStatItem[];
  total: number;
  brandCount: number;
};

const UNKNOWN_BRAND_NAME = '未知品牌';
const UNKNOWN_GAME_NAME = '未知遊戲';
export const MAX_BRAND_CHART_ITEMS = 8;

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

function gameName(ug: UserGameDto): string {
  return ug.gameErogs?.name?.trim() || UNKNOWN_GAME_NAME;
}

function toStatGame(ug: UserGameDto): BrandStatGame {
  return {
    name: gameName(ug),
    brandName: brandName(ug),
    finishedDate: ug.finishedDate ?? null,
  };
}

function compareFinishedDateDesc(a: BrandStatGame, b: BrandStatGame): number {
  const aDate = parseUserGameDate(a.finishedDate) ?? '';
  const bDate = parseUserGameDate(b.finishedDate) ?? '';
  if (aDate === bDate) return a.name.localeCompare(b.name, 'zh-Hant');
  if (!aDate) return 1;
  if (!bDate) return -1;
  return bDate.localeCompare(aDate);
}

function buildBrandStats(games: UserGameDto[], options?: { maxItems?: number }): BrandStatsResult {
  const maxItems = options?.maxItems ?? MAX_BRAND_CHART_ITEMS;
  const counts = new Map<
    string,
    { name: string; value: number; brandErogsId: number | null; games: BrandStatGame[] }
  >();

  for (const ug of games) {
    const key = brandKey(ug);
    const existing = counts.get(key);
    if (existing) {
      existing.value += 1;
      existing.games.push(toStatGame(ug));
      continue;
    }

    counts.set(key, {
      name: brandName(ug),
      value: 1,
      brandErogsId: ug.gameErogs?.brandErogsId ?? null,
      games: [toStatGame(ug)],
    });
  }

  const sorted = [...counts.values()]
    .map((item) => ({
      ...item,
      games: [...item.games].sort(compareFinishedDateDesc),
    }))
    .sort((a, b) => b.value - a.value);
  const brandCount = sorted.length;
  const total = sorted.reduce((sum, item) => sum + item.value, 0);

  if (sorted.length <= maxItems) {
    return { items: sorted, total, brandCount };
  }

  const top = sorted.slice(0, maxItems - 1);
  const rest = sorted.slice(maxItems - 1);
  const restBrandCount = rest.length;
  const restTotal = rest.reduce((sum, item) => sum + item.value, 0);
  const restGames = rest.flatMap((item) => item.games).sort(compareFinishedDateDesc);

  return {
    items: [
      ...top,
      {
        name: `其他（${restBrandCount} 個品牌）`,
        value: restTotal,
        brandErogsId: null,
        games: restGames,
        isOthers: true,
      },
    ],
    total,
    brandCount,
  };
}

function finishedGames(games: UserGameDto[]): UserGameDto[] {
  return games.filter((ug) => ug.status === USER_GAME_STATUS.FINISHED);
}

/** 總覽：統計該玩家全部遊玩完畢紀錄 */
export function aggregateAllBrandStats(
  games: UserGameDto[],
  options?: { maxItems?: number },
): BrandStatsResult {
  return buildBrandStats(finishedGames(games), options);
}

/** 月份：統計指定年月遊玩完畢的紀錄 */
export function aggregateBrandStats(
  games: UserGameDto[],
  year: number,
  month: number,
  options?: { maxItems?: number },
): BrandStatsResult {
  const filtered = finishedGames(games).filter((ug) =>
    isFinishedInMonth(ug.finishedDate, year, month),
  );
  return buildBrandStats(filtered, options);
}

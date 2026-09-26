<template>
  <v-container max-width="md" class="py-8 px-4">
    <div class="mb-4">
      <v-btn variant="text" class="text-none px-0" prepend-icon="mdi-arrow-left" :to="backTo">
        {{ backLabel }}
      </v-btn>
    </div>

    <v-sheet
      v-if="pending"
      rounded="xl"
      border
      color="surface-variant"
      class="game-state pa-10 text-center"
    >
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-body-1 font-weight-medium mb-1">正在查詢批評空間…</p>
      <p class="text-body-2 text-medium-emphasis mb-0">遊戲 ID {{ idParam }}</p>
    </v-sheet>

    <v-sheet
      v-else-if="failed"
      rounded="xl"
      border
      color="surface-variant"
      class="game-state pa-8 text-center"
    >
      <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">{{ errorMessage }}</p>
      <p class="text-body-2 text-medium-emphasis mb-4">無法載入遊戲資料，請稍後再試。</p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refresh()">
        重試
      </v-btn>
    </v-sheet>

    <v-sheet
      v-else-if="!game"
      rounded="xl"
      border
      color="surface-variant"
      class="game-state pa-8 text-center"
    >
      <v-icon size="48" color="medium-emphasis" class="mb-4">mdi-gamepad-variant-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">找不到遊戲</p>
      <p class="text-body-2 text-medium-emphasis mb-4">ID {{ idParam }} 在批評空間沒有對應資料。</p>
      <v-btn color="primary" variant="tonal" :to="backTo">返回</v-btn>
    </v-sheet>

    <v-card v-else variant="outlined" class="rounded-xl overflow-hidden game-detail-card">
      <div v-if="coverUrl" class="game-detail-cover">
        <v-img :src="coverUrl" max-height="320" cover class="game-detail-cover__img">
          <template #placeholder>
            <div class="fill-height game-img-placeholder" />
          </template>
        </v-img>
      </div>

      <v-card-text class="pa-6 pa-md-8">
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
          <div class="text-overline text-medium-emphasis mb-0">Game ID: {{ game.id }}</div>
          <p class="text-caption text-medium-emphasis mb-0">資料來源：批評空間</p>
        </div>

        <div class="mb-4">
          <h1 class="text-h4 font-weight-bold">{{ game.name || '—' }}</h1>
          <p v-if="rankLabel" class="text-subtitle-2 mt-2 mb-0" :class="rankClass">
            {{ rankLabel }}
          </p>
        </div>

        <div class="d-flex flex-wrap ga-2 mb-6">
          <v-chip
            v-if="game.brandName"
            label
            color="primary"
            variant="tonal"
            :to="game.brandId ? `/brand/${game.brandId}` : undefined"
          >
            品牌：{{ game.brandName }}
          </v-chip>
          <v-chip v-if="game.sellDay" label variant="tonal">發售日：{{ game.sellDay }}</v-chip>
          <v-chip
            v-if="game.model"
            label
            variant="tonal"
            :color="erogsGameCategoryChipColor(game.model)"
          >
            {{ game.model }}
          </v-chip>
        </div>

        <v-divider class="mb-6" />

        <div class="game-stats mb-6">
          <div class="game-stat">
            <div class="text-caption text-medium-emphasis">批評空間分數</div>
            <div class="text-subtitle-1 font-weight-bold">{{ displayValue(game.median) }}</div>
          </div>
          <div class="game-stat">
            <div class="text-caption text-medium-emphasis">樣本數</div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ displayValue(game.tokutenCount) }}
            </div>
          </div>
          <div class="game-stat">
            <div class="text-caption text-medium-emphasis">遊玩時數</div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ displayValue(game.totalPlayTimeMedian) }}
            </div>
          </div>
          <div class="game-stat">
            <div class="text-caption text-medium-emphasis">開始理解遊戲樂趣時數</div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ displayValue(game.timeBeforeUnderstandingFunMedian) }}
            </div>
          </div>
          <div v-if="game.junni > 0" class="game-stat">
            <div class="text-caption text-medium-emphasis">排名</div>
            <div class="text-subtitle-1 font-weight-bold">#{{ game.junni }}</div>
          </div>
          <div v-if="ageLabel || okazuLabel" class="game-stat game-stat--tags">
            <div class="text-caption text-medium-emphasis">分級／類型</div>
            <div class="d-flex flex-wrap ga-2 mt-1">
              <v-chip v-if="ageLabel" size="small" label variant="tonal" :color="ageColor">
                {{ ageLabel }}
              </v-chip>
              <v-chip v-if="okazuLabel" size="small" label variant="tonal">
                {{ okazuLabel }}
              </v-chip>
            </div>
          </div>
        </div>

        <div v-if="genres.length" class="mb-6">
          <div class="text-subtitle-2 mb-2">類型</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="g in genres" :key="g" color="secondary" variant="outlined" label>
              {{ g }}
            </v-chip>
          </div>
        </div>

        <div v-if="creatorGroups.length" class="mb-6">
          <div class="text-subtitle-2 mb-3">製作陣容</div>
          <div class="d-flex flex-column ga-3">
            <div v-for="group in creatorGroups" :key="group.type">
              <div class="text-caption text-medium-emphasis mb-1">{{ group.label }}</div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="(name, idx) in group.names"
                  :key="`${group.type}-${idx}`"
                  size="small"
                  variant="tonal"
                  label
                >
                  {{ name }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div v-if="game.shoukai" class="mb-6">
          <div class="text-subtitle-2 mb-2">遊戲簡介</div>
          <p class="text-body-1 text-medium-emphasis game-shoukai mb-0">{{ game.shoukai }}</p>
        </div>

        <div v-if="externalLinks.length" class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="link in externalLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            variant="tonal"
            size="small"
            class="text-none"
            prepend-icon="mdi-open-in-new"
          >
            {{ link.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { erogsGameCategoryChipColor } from '~/utils/erogsGameCategory';
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import type { ErogsOfficialGame } from '~/types/erogs-api';
import type { ApiResponse, FetchErrorLike } from '~/types/user-api';

definePageMeta({ middleware: 'auth' });

const SHUBETU_LABELS: Record<number, string> = {
  1: '原画',
  2: 'シナリオ',
  3: '音楽',
  4: 'キャラデザ',
  5: '声優',
  6: '歌手',
};

const PLACEHOLDER_IMAGE_URL = 'https://cdn.kurohelper.com/docs/neneGIF.gif';

const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);

const brandFromQuery = computed(() => {
  const raw = route.query.brand;
  return typeof raw === 'string' ? raw.trim() : '';
});

const backTo = computed(() => (brandFromQuery.value ? `/brand/${brandFromQuery.value}` : '/brand'));
const backLabel = computed(() => (brandFromQuery.value ? '返回品牌' : '返回品牌列表'));

const emptyResponse = (): ApiResponse<ErogsOfficialGame | null> => ({
  message: '',
  data: null,
});

const gameFetchUrl = computed(
  (): string => `/api/erogs/game/${encodeURIComponent(idParam.value || '0')}`,
);

const {
  data: response,
  pending,
  error,
  status,
  refresh,
} = useFetch<ApiResponse<ErogsOfficialGame | null>, FetchErrorLike>(gameFetchUrl, {
  default: emptyResponse,
});

watch(error, (err) => {
  if (err) logApiError(err);
});

const failed = computed(() => status.value === 'error');
const errorMessage = computed(() =>
  error.value ? apiErrorUserMessage(error.value) : '請稍後再試。',
);

const game = computed(() => response.value?.data ?? null);

function displayValue(value: string | null | undefined) {
  const text = value?.trim() ?? '';
  if (!text || text === '無' || text === '未收錄') return '—';
  return text;
}

function makeDmmImageUrl(dmm: string) {
  const key = dmm.trim();
  if (!key) return '';
  return `https://pics.dmm.co.jp/digital/pcgame/${key}/${key}pl.jpg`;
}

const coverUrl = computed(() => {
  if (!game.value) return PLACEHOLDER_IMAGE_URL;
  const dmm = makeDmmImageUrl(game.value.dmm);
  return dmm || PLACEHOLDER_IMAGE_URL;
});

const ageLabel = computed(() => {
  switch (game.value?.erogame) {
    case 'true':
      return '18禁';
    case 'false':
      return '全年齡';
    default:
      return '';
  }
});

const ageColor = computed(() => (game.value?.erogame === 'true' ? 'error' : 'success'));

const okazuLabel = computed(() => {
  switch (game.value?.okazu) {
    case 'true':
      return '拔作';
    case 'false':
      return '非拔作';
    default:
      return '';
  }
});

const genres = computed((): string[] =>
  (game.value?.genre ?? '')
    .split(/[,、／/]/)
    .map((g: string) => g.trim())
    .filter(Boolean)
    .filter((g: string) => g !== '無'),
);

const rankLabel = computed(() => {
  const junni = game.value?.junni ?? 0;
  if (!junni || junni > 500) return '';
  if (junni <= 50) return '批評空間 TOP 50';
  if (junni <= 100) return '批評空間 TOP 100';
  return '批評空間 TOP 500';
});

const rankClass = computed(() => {
  const junni = game.value?.junni ?? 0;
  if (junni > 0 && junni <= 50) return 'rank-gold';
  if (junni <= 100) return 'rank-silver';
  return 'rank-bronze';
});

const creatorGroups = computed(() => {
  const creators = game.value?.creators ?? [];
  const map = new Map<number, string[]>();
  for (const item of creators) {
    const labelName = item.shubetuDetailName?.trim()
      ? `${item.creatorName}（${item.shubetuDetailName}）`
      : item.creatorName;
    if (!labelName.trim()) continue;
    const list = map.get(item.shubetuType) ?? [];
    list.push(labelName);
    map.set(item.shubetuType, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([type, names]) => ({
      type,
      label: SHUBETU_LABELS[type] ?? `職種 ${type}`,
      names,
    }));
});

const externalLinks = computed(() => {
  if (!game.value) return [] as { label: string; href: string }[];
  const links: { label: string; href: string }[] = [
    {
      label: '批評空間',
      href: `https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game=${game.value.id}`,
    },
  ];
  if (game.value.vndbId?.trim()) {
    links.push({ label: 'VNDB', href: `https://vndb.org/${game.value.vndbId.trim()}` });
  }
  if (game.value.steamId?.trim()) {
    links.push({
      label: 'Steam',
      href: `https://store.steampowered.com/app/${game.value.steamId.trim()}`,
    });
  }
  return links;
});
</script>

<style scoped>
.game-state {
  border-style: dashed;
}

.game-detail-card {
  background: linear-gradient(
    160deg,
    rgba(var(--v-theme-surface-variant), 0.55) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
}

.game-detail-cover {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.28);
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.game-detail-cover__img {
  width: 100%;
}

.game-img-placeholder {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (min-width: 600px) {
  .game-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.game-stat {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.28);
  background: rgba(var(--v-theme-surface-variant), 0.35);
}

.game-shoukai {
  white-space: pre-wrap;
  line-height: 1.7;
}

.rank-gold {
  color: #c9a227;
}

.rank-silver {
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.rank-bronze {
  color: #b87333;
}
</style>

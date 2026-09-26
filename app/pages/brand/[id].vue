<template>
  <v-container max-width="lg" class="py-8 px-4">
    <div class="mb-4">
      <v-btn variant="text" class="text-none px-0" prepend-icon="mdi-arrow-left" :to="'/brand'">
        返回品牌列表
      </v-btn>
    </div>

    <div v-if="brandPending" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <v-sheet
      v-else-if="brandFailed"
      rounded="xl"
      border
      color="surface-variant"
      class="brand-detail-state pa-8 text-center"
    >
      <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">{{ brandErrorMessage }}</p>
      <p class="text-body-2 text-medium-emphasis mb-4">無法載入品牌資料，請稍後再試。</p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshBrand()">
        重試
      </v-btn>
    </v-sheet>

    <v-sheet
      v-else-if="!brand"
      rounded="xl"
      border
      color="surface-variant"
      class="brand-detail-state pa-8 text-center"
    >
      <v-icon size="48" color="medium-emphasis" class="mb-4">mdi-domain-off</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">找不到品牌</p>
      <p class="text-body-2 text-medium-emphasis mb-4">ID {{ idParam }} 不存在或尚未建檔。</p>
      <v-btn color="primary" variant="tonal" :to="'/brand'">回到列表</v-btn>
    </v-sheet>

    <template v-else>
      <v-card variant="outlined" class="rounded-xl overflow-hidden brand-detail-card mb-6">
        <v-card-text class="pa-6 pa-md-8">
          <div class="text-overline text-medium-emphasis mb-4">Brand ID: {{ brand.id }}</div>

          <div class="d-flex align-center ga-4 mb-4">
            <v-avatar size="72" rounded="lg" class="brand-detail-avatar">
              <span class="text-h5 font-weight-bold">{{ brandInitials(brand) }}</span>
            </v-avatar>
            <div class="min-w-0">
              <h1 class="text-h4 font-weight-bold text-truncate">{{ brand.name || '—' }}</h1>
            </div>
          </div>

          <v-divider class="mb-6" />

          <div class="d-flex flex-wrap ga-2 mb-2">
            <v-chip label color="primary" variant="tonal">{{ brand.gameCount }} 款遊戲</v-chip>
            <v-chip label :color="brand.disband ? 'error' : 'success'" variant="tonal">
              {{ brand.disband ? '已解散' : '營運中' }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
        <div>
          <h2 class="text-h6 font-weight-bold mb-1">遊戲列表</h2>
          <p v-if="!gamesPending && !gamesFailed" class="text-body-2 text-medium-emphasis mb-0">
            共 {{ filteredGames.length }} 款遊戲
            <template v-if="nameKeyword.trim()">（全部 {{ games.length }}）</template>
          </p>
          <p class="text-caption text-medium-emphasis mb-0 mt-1">資料來源：批評空間</p>
        </div>

        <div class="brand-toolbar__right d-flex align-center ga-2 flex-nowrap">
          <v-text-field
            v-model="nameKeyword"
            class="brand-name-filter"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            single-line
            placeholder="篩選遊戲名稱"
            prepend-inner-icon="mdi-magnify"
          />
          <div
            v-if="!gamesPending && !gamesFailed && gamePages.length > 0"
            class="d-flex align-center ga-2 flex-none"
          >
            <v-btn
              icon="mdi-chevron-left"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="gamePage <= 0"
              @click="gamePage--"
            />
            <span class="text-body-2 text-medium-emphasis text-no-wrap">
              {{ gamePage + 1 }} / {{ gamePages.length }}
            </span>
            <v-btn
              icon="mdi-chevron-right"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="gamePage >= gamePages.length - 1"
              @click="gamePage++"
            />
          </div>
        </div>
      </div>

      <div v-if="gamesPending" class="d-flex justify-center py-16">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>

      <v-sheet
        v-else-if="gamesFailed"
        rounded="xl"
        border
        color="surface-variant"
        class="brand-detail-state pa-8 text-center"
      >
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <p class="text-body-1 font-weight-medium mb-2">{{ gamesErrorMessage }}</p>
        <p class="text-body-2 text-medium-emphasis mb-4">無法載入遊戲列表，請稍後再試。</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshGames()">
          重試
        </v-btn>
      </v-sheet>

      <v-sheet
        v-else-if="games.length === 0"
        rounded="xl"
        border
        color="surface-variant"
        class="brand-detail-state pa-8 text-center"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">此品牌尚無遊戲資料。</p>
      </v-sheet>

      <v-sheet
        v-else-if="filteredGames.length === 0"
        rounded="xl"
        border
        color="surface-variant"
        class="brand-detail-state pa-8 text-center"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          找不到符合「{{ nameKeyword.trim() }}」的遊戲。
        </p>
      </v-sheet>

      <v-window v-else v-model="gamePage" class="carousel-window" :touch="false">
        <v-window-item v-for="(page, pageIndex) in gamePages" :key="`game-page-${pageIndex}`">
          <v-row density="comfortable">
            <v-col v-for="item in page" :key="item.id" cols="12" sm="6" md="4" lg="3">
              <v-card
                rounded="xl"
                variant="outlined"
                class="game-card h-100 d-flex flex-column"
                :to="`/game/${item.id}?brand=${brand.id}`"
              >
                <v-img
                  :src="gameImage(item)"
                  height="140"
                  cover
                  class="flex-shrink-0 game-card-img"
                  :eager="pageIndex === 0"
                >
                  <template #placeholder>
                    <div class="fill-height game-img-placeholder" />
                  </template>
                </v-img>

                <v-card-text class="pa-4 d-flex flex-column align-center text-center">
                  <div
                    class="game-card__name text-subtitle-1 font-weight-bold mb-2"
                    :title="item.name"
                  >
                    {{ item.name || '—' }}
                  </div>

                  <v-chip size="small" variant="tonal" label class="mb-2">
                    ID {{ item.id }}
                  </v-chip>

                  <v-chip
                    v-if="item.category"
                    size="x-small"
                    :color="erogsGameCategoryChipColor(item.category)"
                    variant="tonal"
                    label
                  >
                    {{ item.category }}
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { erogsGameCategoryChipColor } from '~/utils/erogsGameCategory';
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import type { BrandErogsItem, GameErogsItem } from '~/types/erogs-api';
import type { ApiResponse, FetchErrorLike } from '~/types/user-api';

definePageMeta({ middleware: 'auth' });

const PAGE_SIZE = 20;
const PLACEHOLDER_IMAGE_URL = 'https://cdn.kurohelper.com/docs/neneGIF.gif';

const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);

const brandId = computed(() => {
  const id = Number(idParam.value);
  return Number.isFinite(id) && id > 0 ? id : null;
});

const emptyBrandResponse = (): ApiResponse<BrandErogsItem[]> => ({
  message: '',
  data: [],
});

const emptyGamesResponse = (): ApiResponse<GameErogsItem[]> => ({
  message: '',
  data: [],
});

const {
  data: brandsResponse,
  pending: brandPending,
  error: brandError,
  status: brandStatus,
  refresh: refreshBrand,
} = useFetch<ApiResponse<BrandErogsItem[]>, FetchErrorLike>('/api/erogs/brand/', {
  default: emptyBrandResponse,
});

const {
  data: gamesResponse,
  pending: gamesPending,
  error: gamesError,
  status: gamesStatus,
  refresh: refreshGames,
} = useFetch<ApiResponse<GameErogsItem[]>, FetchErrorLike>('/api/erogs/game/', {
  default: emptyGamesResponse,
  query: computed(() => ({
    brandid: brandId.value ?? undefined,
  })),
  watch: [brandId],
  immediate: false,
});

watch(
  brandId,
  (id) => {
    if (id != null) void refreshGames();
  },
  { immediate: true },
);

watch(brandError, (err) => {
  if (err) logApiError(err);
});
watch(gamesError, (err) => {
  if (err) logApiError(err);
});

const brandFailed = computed(() => brandStatus.value === 'error');
const brandErrorMessage = computed(() =>
  brandError.value ? apiErrorUserMessage(brandError.value) : '請稍後再試。',
);

const gamesFailed = computed(() => gamesStatus.value === 'error');
const gamesErrorMessage = computed(() =>
  gamesError.value ? apiErrorUserMessage(gamesError.value) : '請稍後再試。',
);

const brand = computed(() => {
  if (brandId.value == null) return null;
  return (brandsResponse.value?.data ?? []).find((item) => item.id === brandId.value) ?? null;
});

const games = computed(() => [...(gamesResponse.value?.data ?? [])].sort((a, b) => b.id - a.id));

const nameKeyword = ref('');
const gamePage = ref(0);

const filteredGames = computed(() => {
  const keyword = nameKeyword.value.trim().toLocaleLowerCase();
  if (!keyword) return games.value;
  return games.value.filter((item) => item.name?.toLocaleLowerCase().includes(keyword));
});

const chunk = <T,>(items: T[], size: number) => {
  if (size <= 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const gamePages = computed(() => chunk(filteredGames.value, PAGE_SIZE));

watch(nameKeyword, () => {
  gamePage.value = 0;
});

watch(gamePages, (pages) => {
  if (gamePage.value > Math.max(0, pages.length - 1)) gamePage.value = 0;
});

watch(brandId, () => {
  nameKeyword.value = '';
  gamePage.value = 0;
});

function brandInitials(item: BrandErogsItem) {
  const name = item.name?.trim() || '';
  return name ? name.slice(0, 1).toUpperCase() : '?';
}

function gameImage(item: GameErogsItem) {
  const image = item.image?.trim();
  return image || PLACEHOLDER_IMAGE_URL;
}
</script>

<style scoped>
.brand-detail-card {
  background: linear-gradient(
    160deg,
    rgba(var(--v-theme-surface-variant), 0.55) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
}

.brand-detail-avatar {
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgba(var(--v-theme-surface-variant), 0.6);
  flex: none;
}

.brand-detail-state {
  border-style: dashed;
}

.brand-toolbar__right {
  margin-left: auto;
}

.brand-name-filter {
  width: 180px;
  flex: 0 0 180px;
  max-width: 180px;
}

.brand-name-filter :deep(.v-field) {
  min-height: 32px !important;
}

.brand-name-filter :deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.game-card {
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
  border-color: rgba(var(--v-theme-primary), 0.45) !important;
}

.game-card-img {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.game-img-placeholder {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.game-card__name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carousel-window {
  overflow: hidden;
}
</style>

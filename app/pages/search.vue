<template>
  <v-container max-width="md" class="search-page py-8 py-md-12 px-4">
    <header class="search-heading mb-7 mb-md-8">
      <div class="search-heading__eyebrow">
        <span class="search-heading__dot" />
        KUROHELPER DATABASE
      </div>
      <h1 class="search-heading__title">查詢{{ searchLabel }}</h1>
      <p class="search-heading__description">輸入關鍵字，探索{{ searchLabel }}資料。</p>
      <v-chip
        class="mt-3"
        size="small"
        color="orange"
        variant="tonal"
        prepend-icon="mdi-database-outline"
        label
      >
        資料來源：批評空間
      </v-chip>
    </header>

    <v-card rounded="xl" border class="search-card">
      <v-card-text class="pa-5 pa-md-7">
        <v-btn-toggle
          v-model="searchMode"
          mandatory
          density="compact"
          variant="flat"
          class="sliding-toggle sliding-toggle--icons mb-5"
          :class="{
            'sliding-toggle--second': searchMode === 'brand',
            'sliding-toggle--third': searchMode === 'music',
          }"
          aria-label="查詢類型"
        >
          <v-btn value="game" size="small"
            ><v-icon start>mdi-gamepad-variant-outline</v-icon>遊戲</v-btn
          >
          <v-btn value="brand" size="small"><v-icon start>mdi-domain</v-icon>品牌</v-btn>
          <v-btn value="music" size="small"
            ><v-icon start>mdi-music-note-outline</v-icon>音樂</v-btn
          >
        </v-btn-toggle>
        <Transition name="search-mode" mode="out-in">
          <div :key="searchMode" class="search-card__heading mb-4">
            <div class="search-card__icon">
              <v-icon :icon="searchOptions[searchMode].icon" size="22" />
            </div>
            <div>
              <h2 class="text-subtitle-1 font-weight-bold">{{ searchLabel }}查詢</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ searchOptions[searchMode].description }}
              </p>
            </div>
          </div>
        </Transition>
        <div class="search-form">
          <Transition name="search-mode" mode="out-in">
            <v-combobox
              v-if="searchMode === 'game'"
              key="game"
              v-model:search="query"
              v-model="selectedGame"
              :items="autocompleteItems"
              :loading="autocompleteLoading"
              item-title="name"
              item-value="id"
              return-object
              label="遊戲名稱"
              placeholder="輸入遊戲名稱，例如：Summer Pockets"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details="auto"
              no-filter
              class="search-form__input"
              @update:model-value="selectGame"
              @keydown.enter.prevent="submitSearch"
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.name"
                  :subtitle="item.category || '未分類'"
                >
                  <template #prepend>
                    <v-avatar rounded="lg" color="primary" variant="tonal">
                      <span class="text-caption font-weight-bold">{{ item.name.slice(0, 1) }}</span>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
              <template #no-data>
                <v-list-item title="沒有符合的遊戲資料">
                  <v-list-item-subtitle>你仍可直接輸入關鍵字並按下搜尋</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-combobox>
            <v-text-field
              v-else
              :key="searchMode"
              v-model="query"
              :label="`${searchLabel}名稱`"
              :placeholder="searchOptions[searchMode].placeholder"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details="auto"
              class="search-form__input"
              @keydown.enter.prevent="submitSearch"
            />
          </Transition>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-magnify"
            class="search-form__button"
            :disabled="!query?.trim()"
            :loading="searchLoading"
            @click="submitSearch"
          >
            搜尋
          </v-btn>
        </div>
        <p class="search-card__hint mt-3 mb-0">
          <v-icon icon="mdi-keyboard-return" size="16" />
          按 Enter 或點擊搜尋
        </p>
      </v-card-text>
    </v-card>

    <section v-if="hasSearched" class="results-section mt-10">
      <div class="results-heading d-flex flex-wrap align-center justify-space-between ga-4 mb-5">
        <div class="results-heading__title">
          <div class="results-heading__icon">
            <v-icon icon="mdi-view-list-outline" size="20" />
          </div>
          <div>
            <h2 class="text-h6 font-weight-bold">搜尋結果</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              關鍵字：<span class="results-heading__keyword">{{ submittedQuery }}</span>
            </p>
          </div>
        </div>
        <div v-if="!searchLoading && !searchError" class="d-flex flex-wrap align-center ga-3">
          <span class="results-count"> {{ resultCount }} 筆結果 </span>
          <GamePlatformFilter
            v-if="submittedMode === 'game'"
            v-model="selectedPlatform"
            :games="submittedResults"
          />
        </div>
      </div>

      <div v-if="searchLoading" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>
      <LoadErrorState
        v-else-if="searchError"
        :message="`無法搜尋${submittedLabel}`"
        :detail="searchErrorDetail"
        @retry="runSearch(submittedQuery, submittedMode)"
      />
      <v-alert v-else-if="!hasResults" type="info" variant="tonal" rounded="lg">
        找不到「{{ submittedQuery }}」相關的{{ submittedLabel }}。
      </v-alert>
      <v-alert v-else-if="resultCount === 0" type="info" variant="tonal" rounded="lg">
        找不到符合篩選條件的遊戲。
      </v-alert>

      <v-row v-else-if="submittedMode === 'music'" density="comfortable">
        <v-col v-for="music in pagedMusics" :key="music.id" cols="12">
          <v-card
            rounded="xl"
            variant="outlined"
            class="game-card h-100 d-flex align-center pa-4 ga-4"
            :to="`/music/${music.id}`"
            :aria-label="`查看音樂：${music.name}`"
          >
            <v-img
              :src="music.image?.trim() || PLACEHOLDER_IMAGE_URL"
              :alt="music.name"
              width="96"
              height="96"
              cover
              class="flex-grow-0 flex-shrink-0 rounded-lg game-card-img"
            >
              <template #placeholder>
                <div class="fill-height game-img-placeholder" />
              </template>
              <template #error>
                <div class="fill-height d-flex align-center justify-center text-medium-emphasis">
                  <v-icon icon="mdi-music-note-outline" size="32" />
                </div>
              </template>
            </v-img>
            <v-card-text class="pa-0 min-w-0">
              <div class="game-card__eyebrow mb-1">MUSIC INFORMATION</div>
              <div
                class="game-card__name text-subtitle-1 font-weight-bold mb-2"
                :title="music.name"
              >
                {{ music.name || '—' }}
              </div>
              <p
                v-if="music.games.length"
                class="music-card__games text-body-2 text-medium-emphasis mb-2"
              >
                收錄作品：{{ music.games.join('、') }}
              </p>
              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" variant="tonal" label>ID {{ music.id }}</v-chip>
                <v-chip v-if="music.category" size="small" color="secondary" variant="tonal" label>
                  {{ music.category }}
                </v-chip>
                <v-chip
                  v-if="music.tokutenCount > 0"
                  size="small"
                  color="warning"
                  variant="tonal"
                  label
                >
                  {{ music.avgTokuten.toFixed(2) }} 分 · {{ music.tokutenCount }} 筆評分
                </v-chip>
                <v-chip v-else size="small" variant="tonal" label>尚無評分</v-chip>
              </div>
            </v-card-text>
            <v-icon class="game-card__arrow flex-shrink-0" icon="mdi-arrow-right" size="20" />
          </v-card>
        </v-col>
        <v-col v-if="musicPageCount > 1" cols="12">
          <v-pagination
            v-model="musicPage"
            :length="musicPageCount"
            :total-visible="5"
            density="comfortable"
            aria-label="音樂搜尋結果分頁"
          />
        </v-col>
      </v-row>
      <v-row v-else-if="submittedMode === 'brand'" density="comfortable">
        <v-col v-for="brand in submittedBrands" :key="brand.id" cols="12">
          <v-card
            rounded="xl"
            variant="outlined"
            class="game-card h-100 d-flex align-center pa-4 ga-4"
            :to="`/brand/${brand.id}`"
          >
            <v-avatar size="64" rounded="lg" color="primary" variant="tonal" class="flex-shrink-0">
              <v-icon icon="mdi-domain" size="32" />
            </v-avatar>
            <v-card-text class="pa-0 min-w-0">
              <div class="game-card__eyebrow mb-1">BRAND INFORMATION</div>
              <div
                class="game-card__name text-subtitle-1 font-weight-bold mb-2"
                :title="brand.name"
              >
                {{ brand.name || '—' }}
              </div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" variant="tonal" label>ID {{ brand.id }}</v-chip>
                <v-chip size="small" color="primary" variant="tonal" label>
                  {{ brand.gameCount }} 款遊戲
                </v-chip>
                <v-chip v-if="brand.disband" size="small" color="warning" variant="tonal" label>
                  已解散
                </v-chip>
              </div>
            </v-card-text>
            <v-icon class="game-card__arrow flex-shrink-0" icon="mdi-arrow-right" size="20" />
          </v-card>
        </v-col>
      </v-row>
      <v-row v-else density="comfortable">
        <v-col v-for="game in filteredResults" :key="game.id" cols="12">
          <v-card
            rounded="xl"
            variant="outlined"
            class="game-card h-100 d-flex align-center pa-4 ga-4"
            :to="`/game/${game.id}`"
          >
            <v-img
              :src="gameImage(game)"
              width="96"
              height="96"
              cover
              class="flex-grow-0 flex-shrink-0 rounded-lg game-card-img"
            >
              <template #placeholder>
                <div class="fill-height game-img-placeholder" />
              </template>
            </v-img>
            <v-card-text class="pa-0 min-w-0">
              <div class="game-card__eyebrow mb-1">GAME INFORMATION</div>
              <div class="game-card__name text-subtitle-1 font-weight-bold mb-2" :title="game.name">
                {{ game.name || '—' }}
              </div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" variant="tonal" label> ID {{ game.id }} </v-chip>
                <GamePlatformChip :category="game.category" />
              </div>
            </v-card-text>
            <v-icon class="game-card__arrow flex-shrink-0" icon="mdi-arrow-right" size="20" />
          </v-card>
        </v-col>
      </v-row>
    </section>
    <div v-else class="search-empty mt-8">
      <v-icon icon="mdi-text-search" size="20" />
      <span>輸入名稱，開始搜尋{{ searchLabel }}</span>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import type { BrandErogsItem, ErogsMusicListItem, GameErogsItem } from '~/types/erogs-api';
import type { ErogsGameAutocompleteItem } from '~/types/game-erogs-api';
import type { ApiResponse, FetchErrorLike } from '~/types/user-api';
import { logApiError } from '~/utils/apiError';

definePageMeta({ middleware: 'auth' });

const PLACEHOLDER_IMAGE_URL = 'https://cdn.kurohelper.com/docs/neneGIF.gif';

type SearchMode = 'game' | 'brand' | 'music';

const searchOptions = {
  game: {
    label: '遊戲',
    icon: 'mdi-gamepad-variant-outline',
    description: '選擇建議項目，或直接輸入關鍵字',
    placeholder: '輸入遊戲名稱，例如：Summer Pockets',
  },
  brand: {
    label: '品牌',
    icon: 'mdi-domain',
    description: '輸入品牌名稱或部分關鍵字',
    placeholder: '輸入品牌名稱，例如：Key',
  },
  music: {
    label: '音樂',
    icon: 'mdi-music-note-outline',
    description: '輸入歌曲名稱，直接查詢批評空間',
    placeholder: '輸入歌曲名稱，例如：鳥の詩',
  },
};

const query = ref<string | undefined>('');
const searchMode = ref<SearchMode>('game');
const searchLabel = computed(() => searchOptions[searchMode.value].label);
const selectedGame = ref<ErogsGameAutocompleteItem | string | null>(null);
const hasSearched = ref(false);
const submittedQuery = ref('');
const submittedMode = ref<SearchMode>('game');
const submittedLabel = computed(() => searchOptions[submittedMode.value].label);
const submittedResults = ref<GameErogsItem[]>([]);
const submittedBrands = ref<BrandErogsItem[]>([]);
const submittedMusics = ref<ErogsMusicListItem[]>([]);
const musicPage = ref(1);
const MUSIC_PAGE_SIZE = 20;
const musicPageCount = computed(() => Math.ceil(submittedMusics.value.length / MUSIC_PAGE_SIZE));
const pagedMusics = computed(() =>
  submittedMusics.value.slice(
    (musicPage.value - 1) * MUSIC_PAGE_SIZE,
    musicPage.value * MUSIC_PAGE_SIZE,
  ),
);
const selectedPlatform = ref<string | null>(null);
const searchLoading = ref(false);
const searchError = ref(false);
const searchErrorDetail = ref('請稍後再試。');
let searchRequestId = 0;

const filteredResults = computed(() =>
  submittedResults.value.filter(
    (game) =>
      selectedPlatform.value === null || (game.category?.trim() || '') === selectedPlatform.value,
  ),
);

const resultCount = computed(() => {
  if (submittedMode.value === 'music') return submittedMusics.value.length;
  return submittedMode.value === 'game'
    ? filteredResults.value.length
    : submittedBrands.value.length;
});
const hasResults = computed(() =>
  submittedMode.value === 'game' ? submittedResults.value.length > 0 : resultCount.value > 0,
);

const {
  items: autocompleteItems,
  loading: autocompleteLoading,
  search: searchAutocomplete,
  reset: resetAutocomplete,
} = useErogsGameAutocomplete();

watch(searchMode, () => {
  selectedGame.value = null;
  query.value = '';
  resetAutocomplete();
});

watch(query, (value) => {
  if (searchMode.value === 'game') searchAutocomplete(value ?? '');
});

function selectGame(game: ErogsGameAutocompleteItem | string | null) {
  if (game) query.value = typeof game === 'string' ? game : game.name;
}

function gameImage(game: GameErogsItem) {
  return game.image?.trim() || PLACEHOLDER_IMAGE_URL;
}

function submitSearch() {
  const keyword = (query.value ?? '').trim();
  if (!keyword) return;

  void runSearch(keyword, searchMode.value);
}

async function runSearch(keyword: string, mode: SearchMode) {
  const requestId = ++searchRequestId;
  submittedQuery.value = keyword;
  submittedMode.value = mode;
  submittedResults.value = [];
  submittedBrands.value = [];
  submittedMusics.value = [];
  musicPage.value = 1;
  selectedPlatform.value = null;
  hasSearched.value = true;
  searchLoading.value = true;
  searchError.value = false;
  searchErrorDetail.value = '請稍後再試。';

  try {
    if (mode === 'brand') {
      const response = await $fetch<ApiResponse<BrandErogsItem[]>>('/api/erogs/brand/', {
        query: { q: keyword },
      });
      if (requestId === searchRequestId) submittedBrands.value = response.data ?? [];
    } else if (mode === 'music') {
      const response = await $fetch<ApiResponse<ErogsMusicListItem[]>>('/api/erogs/music/', {
        query: { q: keyword },
        retry: 0,
      });
      if (requestId === searchRequestId) submittedMusics.value = response.data ?? [];
    } else {
      const response = await $fetch<ApiResponse<GameErogsItem[]>>('/api/erogs/game/', {
        query: { q: keyword },
      });
      if (requestId === searchRequestId) submittedResults.value = response.data ?? [];
    }
  } catch (error) {
    if (requestId === searchRequestId) {
      logApiError(error);
      searchError.value = true;
      const status = (error as FetchErrorLike).statusCode ?? (error as FetchErrorLike).status;
      if (status === 429) searchErrorDetail.value = '批評空間查詢過於頻繁，請稍後再試。';
    }
  } finally {
    if (requestId === searchRequestId) searchLoading.value = false;
  }
}
</script>

<style scoped>
.search-mode-enter-active,
.search-mode-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.search-mode-enter-from,
.search-mode-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.search-heading__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.search-heading__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.6);
}

.search-heading__title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.2;
}

.search-heading__description {
  margin: 10px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.95rem;
}

.search-card {
  border-color: rgba(var(--v-theme-outline), 0.8);
  background:
    radial-gradient(circle at 100% 0%, rgba(var(--v-theme-primary), 0.1), transparent 45%),
    rgb(var(--v-theme-surface));
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}

.search-card__heading,
.results-heading__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-card__icon,
.results-heading__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.results-heading__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.search-form {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.search-form__input {
  min-width: 0;
  flex: 1;
}

.search-form__button {
  min-height: 48px !important;
  padding-inline: 24px;
}

.search-card__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.75rem;
}

.results-heading__keyword {
  color: rgb(var(--v-theme-on-surface));
  overflow-wrap: anywhere;
}

.results-count {
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.875rem;
}

.search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 22px;
  border: 1px dashed rgba(var(--v-theme-outline), 0.6);
  border-radius: 16px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
}

.game-card {
  cursor: pointer;
  border-color: rgba(var(--v-theme-outline), 0.6);
  background: rgba(var(--v-theme-surface), 0.72);
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

.game-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 3px;
}

.music-card__games {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow-wrap: anywhere;
}

.game-card-img {
  border: 1px solid rgba(var(--v-theme-outline), 0.35);
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.game-card__eyebrow {
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.game-card__arrow {
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.game-card:hover .game-card__arrow {
  color: rgb(var(--v-theme-primary));
  transform: translateX(3px);
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

@media (max-width: 599px) {
  .search-form {
    flex-direction: column;
  }

  .search-form__input,
  .search-form__button {
    width: 100%;
  }
}
</style>

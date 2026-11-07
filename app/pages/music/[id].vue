<template>
  <v-container max-width="md" class="py-8 px-4">
    <div class="mb-4">
      <v-btn variant="text" class="text-none px-0" prepend-icon="mdi-arrow-left" to="/search">
        返回查詢
      </v-btn>
    </div>

    <v-sheet
      v-if="status === 'pending' || status === 'idle'"
      rounded="xl"
      border
      color="surface-variant"
      class="music-state pa-10 text-center"
    >
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-body-1 font-weight-medium mb-1">正在查詢批評空間的音樂資料…</p>
      <p class="text-body-2 text-medium-emphasis mb-0">音樂 ID {{ idParam }}</p>
    </v-sheet>

    <LoadErrorState
      v-else-if="error"
      :message="errorMessage"
      detail="請稍後再試。"
      @retry="refresh()"
    />

    <v-sheet
      v-else-if="!music"
      rounded="xl"
      border
      color="surface-variant"
      class="music-state pa-8 text-center"
    >
      <v-icon size="48" color="medium-emphasis" class="mb-4">mdi-music-note-off-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">找不到音樂資料</p>
      <p class="text-body-2 text-medium-emphasis mb-4">ID {{ idParam }} 在批評空間沒有對應資料。</p>
      <v-btn color="primary" variant="tonal" to="/search">返回查詢</v-btn>
    </v-sheet>

    <v-card v-else variant="outlined" class="rounded-xl overflow-hidden music-detail-card">
      <v-card-text class="pa-6 pa-md-8">
        <div class="music-detail-header mb-6">
          <v-img
            :src="music.image || PLACEHOLDER_IMAGE_URL"
            :alt="music.name"
            width="200"
            height="140"
            class="music-detail-cover rounded-lg"
          >
            <template #placeholder>
              <div class="fill-height music-img-placeholder" />
            </template>
            <template #error>
              <div class="fill-height d-flex align-center justify-center text-medium-emphasis">
                <v-icon icon="mdi-music-note-outline" size="32" />
              </div>
            </template>
          </v-img>

          <div class="music-detail-summary">
            <div class="d-flex flex-wrap align-center ga-2 mb-3">
              <v-chip size="small" variant="tonal" label>ID {{ music.id }}</v-chip>
              <v-chip
                size="small"
                color="source"
                variant="flat"
                prepend-icon="mdi-database-outline"
                label
              >
                資料來源：批評空間
              </v-chip>
            </div>
            <h1 class="music-detail-title font-weight-bold">{{ music.name || '音樂詳情' }}</h1>
          </div>
        </div>

        <v-divider class="mb-6" />

        <v-row density="comfortable" class="mb-5">
          <v-col v-for="stat in musicStats" :key="stat.label" cols="12" sm="4">
            <v-sheet rounded="lg" color="surface-variant" class="pa-4 h-100">
              <div class="text-caption text-medium-emphasis mb-1">{{ stat.label }}</div>
              <div class="text-subtitle-1 font-weight-bold">{{ stat.value }}</div>
            </v-sheet>
          </v-col>
        </v-row>

        <section class="mb-6">
          <h2 class="text-subtitle-2 mb-3">製作陣容</h2>
          <div class="d-flex flex-column ga-4">
            <div v-for="group in creatorGroups" :key="group.label">
              <h3 class="text-caption text-medium-emphasis mb-2">{{ group.label }}</h3>
              <div v-if="group.names.length" class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="(name, index) in group.names"
                  :key="`${group.label}-${index}`"
                  size="small"
                  variant="tonal"
                  label
                >
                  {{ name }}
                </v-chip>
              </div>
              <p v-else class="text-body-2 text-medium-emphasis mb-0">未提供</p>
            </div>
          </div>
        </section>

        <section v-if="music.games.length" class="mb-6">
          <h2 class="text-subtitle-2 mb-3">收錄作品</h2>
          <v-sheet
            v-for="(game, index) in music.games"
            :key="`${game.name}-${index}`"
            rounded="lg"
            border
            class="pa-3 mb-2"
          >
            <div class="text-body-2 font-weight-medium mb-2">{{ game.name }}</div>
            <div class="d-flex flex-wrap ga-2">
              <GamePlatformChip :category="game.model" />
              <v-chip v-if="game.category" size="small" color="secondary" variant="tonal" label>
                {{ game.category }}
              </v-chip>
            </div>
          </v-sheet>
        </section>

        <section v-if="music.albums.length">
          <h2 class="text-subtitle-2 mb-2">收錄專輯</h2>
          <ul class="pl-5 text-body-2">
            <li v-for="(album, index) in music.albums" :key="index" class="mb-1">{{ album }}</li>
          </ul>
        </section>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import type { ErogsMusic } from '~/types/erogs-api';
import type { ApiResponse, FetchErrorLike } from '~/types/user-api';
import { logApiError } from '~/utils/apiError';

definePageMeta({ middleware: 'auth' });

const PLACEHOLDER_IMAGE_URL = 'https://cdn.kurohelper.com/docs/neneGIF.gif';
const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);
const musicFetchUrl = computed(
  () => `/api/erogs/music/${encodeURIComponent(idParam.value || '0')}`,
);

const {
  data: response,
  status,
  error,
  refresh,
} = useFetch<ApiResponse<ErogsMusic | null>, FetchErrorLike>(musicFetchUrl, {
  server: false,
  retry: 0,
  default: () => ({ message: '', data: null }),
});

watch(error, (value) => {
  if (value) logApiError(value);
});

const music = computed(() => response.value?.data ?? null);
const errorMessage = computed(() => {
  const code = error.value?.statusCode ?? error.value?.status;
  if (code === 429) return '批評空間查詢過於頻繁，請稍後再試';
  if (code === 404) return '找不到音樂資料';
  return '無法載入音樂資料';
});

const musicStats = computed(() => [
  { label: '音樂時長', value: music.value?.playTime || '未提供' },
  { label: '發行日期', value: music.value?.releaseDate || '未提供' },
  {
    label: '平均分數／樣本數',
    value: music.value?.tokutenCount
      ? `${music.value.avgTokuten.toFixed(2)}／${music.value.tokutenCount}`
      : '尚無評分',
  },
]);

const creatorGroups = computed(() => [
  { label: '歌手', names: music.value?.singers ?? [] },
  { label: '作詞', names: music.value?.lyrics ?? [] },
  { label: '作曲', names: music.value?.compositions ?? [] },
  { label: '編曲', names: music.value?.arrangements ?? [] },
]);
</script>

<style scoped>
.music-state {
  border-style: dashed;
}

.music-detail-card {
  background: linear-gradient(
    160deg,
    rgba(var(--v-theme-surface-variant), 0.55) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
}

.music-detail-header {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
}

.music-detail-cover {
  max-width: 100%;
  border: 1px solid rgba(var(--v-theme-outline), 0.28);
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.music-detail-summary {
  min-width: 0;
}

.music-detail-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.music-img-placeholder {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

@media (max-width: 699px) {
  .music-detail-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}
</style>

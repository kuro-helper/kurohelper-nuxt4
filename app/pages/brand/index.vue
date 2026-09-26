<template>
  <v-container max-width="lg" class="py-8 px-4">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">品牌列表</h1>
        <p v-if="!brandsPending && !brandsFailed" class="text-body-2 text-medium-emphasis mb-0">
          共 {{ filteredBrands.length }} 個品牌
          <template v-if="nameKeyword.trim()">（全部 {{ brands.length }}）</template>
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
          placeholder="篩選品牌名稱"
          prepend-inner-icon="mdi-magnify"
        />
        <div
          v-if="!brandsPending && !brandsFailed && brandPages.length > 0"
          class="d-flex align-center ga-2 flex-none"
        >
          <v-btn
            icon="mdi-chevron-left"
            variant="tonal"
            size="small"
            rounded="xl"
            :disabled="brandPage <= 0"
            @click="brandPage--"
          />
          <span class="text-body-2 text-medium-emphasis text-no-wrap">
            {{ brandPage + 1 }} / {{ brandPages.length }}
          </span>
          <v-btn
            icon="mdi-chevron-right"
            variant="tonal"
            size="small"
            rounded="xl"
            :disabled="brandPage >= brandPages.length - 1"
            @click="brandPage++"
          />
        </div>
      </div>
    </div>

    <div v-if="brandsPending" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <v-sheet
      v-else-if="brandsFailed"
      rounded="xl"
      border
      color="surface-variant"
      class="brands-error-state pa-8 text-center"
    >
      <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">{{ brandsErrorMessage }}</p>
      <p class="text-body-2 text-medium-emphasis mb-4">無法載入品牌列表，請稍後再試。</p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshBrands()">
        重試
      </v-btn>
    </v-sheet>

    <v-sheet
      v-else-if="brands.length === 0"
      rounded="xl"
      border
      color="surface-variant"
      class="empty-state pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">尚無品牌資料。</p>
    </v-sheet>

    <v-sheet
      v-else-if="filteredBrands.length === 0"
      rounded="xl"
      border
      color="surface-variant"
      class="empty-state pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">
        找不到符合「{{ nameKeyword.trim() }}」的品牌。
      </p>
    </v-sheet>

    <v-window v-else v-model="brandPage" class="carousel-window" :touch="false">
      <v-window-item v-for="(page, pageIndex) in brandPages" :key="`brand-page-${pageIndex}`">
        <v-row density="comfortable">
          <v-col v-for="item in page" :key="item.id" cols="12" sm="6" md="4" lg="3">
            <v-card
              rounded="xl"
              variant="outlined"
              class="brand-card h-100"
              :to="`/brand/${item.id}`"
            >
              <v-card-text class="pa-4 d-flex flex-column align-center text-center">
                <v-avatar size="72" rounded="lg" class="brand-card__avatar mb-3">
                  <span class="text-h5 font-weight-bold">{{ brandInitials(item) }}</span>
                </v-avatar>

                <div
                  class="brand-card__name text-subtitle-1 font-weight-bold mb-2"
                  :title="item.name"
                >
                  {{ item.name || '—' }}
                </div>

                <v-chip size="small" variant="tonal" label class="mb-2"> ID {{ item.id }} </v-chip>

                <div class="d-flex flex-wrap justify-center ga-2">
                  <v-chip size="x-small" color="primary" variant="tonal" label>
                    {{ item.gameCount }} 款遊戲
                  </v-chip>
                  <v-chip
                    size="x-small"
                    :color="item.disband ? 'error' : 'success'"
                    variant="tonal"
                    label
                  >
                    {{ item.disband ? '已解散' : '營運中' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import type { BrandErogsItem } from '~/types/erogs-api';
import type { ApiResponse, FetchErrorLike } from '~/types/user-api';

definePageMeta({ middleware: 'auth' });

const PAGE_SIZE = 20;

const emptyApiResponse = (): ApiResponse<BrandErogsItem[]> => ({
  message: '',
  data: [],
});

const {
  data: brandsResponse,
  pending: brandsPending,
  error: brandsError,
  status: brandsStatus,
  refresh: refreshBrands,
} = useFetch<ApiResponse<BrandErogsItem[]>, FetchErrorLike>('/api/erogs/brand/', {
  default: emptyApiResponse,
});

watch(brandsError, (err) => {
  if (err) logApiError(err);
});

const brandsFailed = computed(() => brandsStatus.value === 'error');
const brandsErrorMessage = computed(() =>
  brandsError.value ? apiErrorUserMessage(brandsError.value) : '請稍後再試。',
);

const brands = computed(() => [...(brandsResponse.value?.data ?? [])].sort((a, b) => a.id - b.id));

const nameKeyword = ref('');
const brandPage = ref(0);

const filteredBrands = computed(() => {
  const keyword = nameKeyword.value.trim().toLocaleLowerCase();
  if (!keyword) return brands.value;
  return brands.value.filter((item) => item.name?.toLocaleLowerCase().includes(keyword));
});

const chunk = <T,>(items: T[], size: number) => {
  if (size <= 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const brandPages = computed(() => chunk(filteredBrands.value, PAGE_SIZE));

watch(nameKeyword, () => {
  brandPage.value = 0;
});

watch(brandPages, (pages) => {
  if (brandPage.value > Math.max(0, pages.length - 1)) brandPage.value = 0;
});

function brandInitials(item: BrandErogsItem) {
  const name = item.name?.trim() || '';
  return name ? name.slice(0, 1).toUpperCase() : '?';
}
</script>

<style scoped>
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

.brand-card {
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.brand-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
  border-color: rgba(var(--v-theme-primary), 0.45) !important;
}

.brand-card__avatar {
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgba(var(--v-theme-surface-variant), 0.6);
}

.brand-card__name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carousel-window {
  overflow: hidden;
}

.empty-state,
.brands-error-state {
  border-style: dashed;
}
</style>

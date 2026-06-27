<template>
  <v-container max-width="lg" class="py-8 px-4">
    <v-card
      variant="outlined"
      class="rounded-xl overflow-hidden"
      style="
        background: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 100%
        );
      "
    >
      <v-card-text class="pa-6 pa-md-8">
        <div v-if="gamesPending" class="d-flex justify-center py-16">
          <v-progress-circular indeterminate color="primary" size="40" />
        </div>

        <v-sheet
          v-else-if="gamesFailed"
          rounded="xl"
          border
          color="surface-variant"
          class="games-error-state pa-8 text-center"
        >
          <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
          <p class="text-body-1 font-weight-medium mb-2">{{ gamesErrorMessage }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">無法載入使用者資料，請稍後再試。</p>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshGames()">
            重試
          </v-btn>
        </v-sheet>

        <template v-else>
          <div class="d-flex ga-4 align-center justify-space-between mb-6">
            <div class="d-flex ga-4 align-start flex-grow-1 min-w-0">
              <v-avatar size="96" rounded="lg">
                <v-img v-if="user.avatar" :src="user.avatar" alt="" cover />
                <span v-else class="text-h4">{{ initials }}</span>
              </v-avatar>
              <div class="flex-grow-1 min-w-0">
                <UserIdentity :nick-name="user.nickName" :user-name="user.userName" size="lg" />
                <div class="d-flex flex-wrap ga-2 mt-2">
                  <v-chip v-if="user.discordId" color="primary" variant="tonal" label>
                    Discord：{{ user.discordId }}
                  </v-chip>
                  <v-chip v-else color="error" variant="tonal" label>尚未綁定 Discord</v-chip>
                </div>
              </div>
            </div>
            <v-btn
              v-if="canEditProfile"
              color="primary"
              variant="flat"
              class="text-none flex-shrink-0"
              prepend-icon="mdi-account-edit"
              :to="`/user/${idParam}/edit`"
            >
              修改個人資料
            </v-btn>
          </div>

          <v-sheet rounded="xl" border color="surface-variant" class="pa-5 mb-6">
            <div class="text-subtitle-2 mb-2">說明／簡介</div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ user.description || '（無）' }}
            </p>
          </v-sheet>

          <v-divider class="mb-6" />

          <div class="d-flex flex-wrap ga-2 mb-6">
            <v-chip label>建立時間：{{ fmtLocalDate(user.createdAt) }}</v-chip>
            <v-chip label>更新時間：{{ fmtLocalDate(user.updatedAt) }}</v-chip>
          </div>

          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <div class="text-h5 font-weight-bold">遊戲紀錄（UserGame）</div>
            <div class="d-flex align-center flex-wrap ga-2">
              <v-chip size="small" variant="tonal" color="primary"
                >{{ userGames.length }} 筆</v-chip
              >
              <template v-if="gameViewMode === 'card' && gamePages.length > 0">
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
              </template>
              <v-btn-toggle
                v-model="gameViewMode"
                mandatory
                density="compact"
                variant="flat"
                class="view-toggle"
              >
                <v-btn value="card" size="small" class="view-toggle-btn">
                  <v-icon start>mdi-view-grid</v-icon>
                  卡片
                </v-btn>
                <v-btn value="table" size="small" class="view-toggle-btn">
                  <v-icon start>mdi-table</v-icon>
                  表格
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>

          <v-sheet
            v-if="userGames.length === 0"
            rounded="xl"
            border
            color="surface-variant"
            class="empty-state pa-8 text-center"
          >
            <v-img :src="PLACEHOLDER_IMAGE_URL" alt="" max-width="120" class="mx-auto mb-4" />
            <p class="text-body-2 text-medium-emphasis mb-0">尚無關聯遊戲資料。</p>
          </v-sheet>

          <div v-else class="game-view-stack">
            <Transition :name="slideName">
              <div v-show="gameViewMode === 'card'" class="game-view-layer">
                <v-window v-model="gamePage" class="carousel-window" :touch="false">
                  <v-window-item
                    v-for="(page, pageIndex) in gamePages"
                    :key="`game-page-${pageIndex}`"
                  >
                    <div
                      class="game-grid"
                      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
                    >
                      <v-card
                        v-for="(ug, idx) in page"
                        :key="`${ug.gameErogsId}-${pageIndex}-${idx}`"
                        rounded="xl"
                        variant="outlined"
                        class="game-card d-flex flex-column"
                        :class="{ 'game-card--done': isDone(ug) }"
                      >
                        <v-img
                          :src="gameImage(ug)"
                          height="140"
                          cover
                          class="flex-shrink-0 game-card-img"
                          :eager="pageIndex === 0 && idx < 8"
                        >
                          <template #placeholder>
                            <div class="fill-height game-img-placeholder" />
                          </template>
                        </v-img>

                        <v-card-item class="pb-2">
                          <v-card-title
                            :title="gameTitle(ug)"
                            class="game-title text-subtitle-1 font-weight-bold pa-0"
                          >
                            <span class="game-title-text">{{ gameTitle(ug) }}</span>
                          </v-card-title>
                          <v-card-subtitle class="pa-0 mt-2">
                            <div class="d-flex flex-wrap ga-2">
                              <v-chip size="small" variant="tonal" color="info">
                                ID：{{ ug.gameErogsId }}
                              </v-chip>
                              <v-chip
                                size="small"
                                :color="isDone(ug) ? 'success' : 'secondary'"
                                variant="tonal"
                              >
                                {{ statusLabel(ug) }}
                              </v-chip>
                            </div>
                          </v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="pt-0 mt-auto">
                          <div class="game-meta">
                            <div class="game-meta-row">
                              <span class="game-meta-label">開始時間</span>
                              <span class="game-meta-value">{{ fmtLocalDate(ug.startDate) }}</span>
                            </div>
                            <div class="game-meta-row">
                              <span class="game-meta-label">結束時間</span>
                              <span class="game-meta-value">{{
                                fmtLocalDate(ug.finishedDate)
                              }}</span>
                            </div>
                            <div class="game-meta-row">
                              <span class="game-meta-label">建立</span>
                              <span class="game-meta-value text-medium-emphasis">{{
                                fmtLocalDate(ug.createdAt)
                              }}</span>
                            </div>
                            <div class="game-meta-row">
                              <span class="game-meta-label">更新</span>
                              <span class="game-meta-value text-medium-emphasis">{{
                                fmtLocalDate(ug.updatedAt)
                              }}</span>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>
                  </v-window-item>
                </v-window>
              </div>
            </Transition>

            <Transition :name="slideName">
              <div
                v-if="tableReady"
                v-show="gameViewMode === 'table'"
                class="game-table-panel game-view-layer"
              >
                <v-table density="comfortable" class="rounded border bg-surface">
                  <thead>
                    <tr>
                      <th class="text-start">遊戲名稱</th>
                      <th class="text-start">狀態</th>
                      <th class="text-start">開始時間</th>
                      <th class="text-start">結束時間</th>
                      <th class="text-start">建立</th>
                      <th class="text-start">更新</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ug, idx) in userGames" :key="`table-${ug.gameErogsId}-${idx}`">
                      <td class="game-name-td">
                        <div class="game-name-cell">
                          <span v-if="gameMarks(ug)" class="game-name-cell__marks">{{
                            gameMarks(ug)
                          }}</span>
                          <span class="game-name-cell__title" :title="gameTitle(ug)">{{
                            gameTitle(ug)
                          }}</span>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="info"
                            class="game-name-cell__id flex-shrink-0"
                          >
                            ID：{{ ug.gameErogsId }}
                          </v-chip>
                        </div>
                      </td>
                      <td>
                        <v-chip
                          size="small"
                          :color="isDone(ug) ? 'success' : 'secondary'"
                          variant="tonal"
                        >
                          {{ statusLabel(ug) }}
                        </v-chip>
                      </td>
                      <td class="text-caption">{{ fmtLocalDate(ug.startDate) }}</td>
                      <td class="text-caption">{{ fmtLocalDate(ug.finishedDate) }}</td>
                      <td class="text-caption text-medium-emphasis">
                        {{ fmtLocalDate(ug.createdAt) }}
                      </td>
                      <td class="text-caption text-medium-emphasis">
                        {{ fmtLocalDate(ug.updatedAt) }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </Transition>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import { useDisplay } from 'vuetify';
import type { ApiResponse, FetchErrorLike, GetUserGameDto, UserGameDto } from '~/types/user-api';

const PLACEHOLDER_IMAGE_URL = 'https://image.kurohelper.com/docs/neneGIF.gif';

type GameViewMode = 'card' | 'table';

const gameViewMode = ref<GameViewMode>('card');
const tableReady = ref(false);
const gamePage = ref(0);
const display = useDisplay();

const columns = computed(() => (display.lgAndUp.value ? 4 : 2));
const pageSize = computed(() => columns.value * 2);

const chunk = <T,>(items: T[], size: number) => {
  if (size <= 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const VIEW_ORDER: Record<GameViewMode, number> = { card: 0, table: 1 };
const slideName = ref<'slide-next' | 'slide-prev'>('slide-next');

watch(gameViewMode, (next, prev) => {
  slideName.value = VIEW_ORDER[next] >= VIEW_ORDER[prev] ? 'slide-next' : 'slide-prev';
  if (next === 'table') tableReady.value = true;
});

const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);

const { user: authUser, refresh: refreshAuth } = useAuth();
await refreshAuth();
watch(idParam, () => {
  refreshAuth();
});

const canEditProfile = computed(() => {
  const me = authUser.value;
  if (!me) return false;
  return String(me.id) === idParam.value;
});

const emptyApiResponse = <T,>(data: T): ApiResponse<T> => ({
  message: '',
  data,
});

const {
  data: gamesResponse,
  pending: gamesPending,
  error: gamesError,
  status: gamesStatus,
  refresh: refreshGames,
} = useFetch<ApiResponse<GetUserGameDto>, FetchErrorLike>(
  () => `/api/user/${encodeURIComponent(idParam.value)}/game`,
  {
    watch: [idParam],
    default: () =>
      emptyApiResponse<GetUserGameDto>({
        user: {
          id: 0,
          nickName: '',
          discordId: '',
          avatar: '',
          description: '',
          role: 0,
          createdAt: '',
          updatedAt: '',
        },
        games: [],
      }),
  },
);

watch(gamesError, (err) => {
  if (err) logApiError(err);
});

const gamesFailed = computed(() => gamesStatus.value === 'error');

const gamesErrorMessage = computed(() =>
  gamesError.value ? apiErrorUserMessage(gamesError.value) : '請稍後再試。',
);

const userGames = computed(() =>
  gamesFailed.value ? [] : (gamesResponse.value?.data.games ?? []),
);

const gamePages = computed(() => chunk(userGames.value, pageSize.value));

watch(idParam, () => {
  gamePage.value = 0;
});

watch(gamePages, (pages) => {
  if (gamePage.value > Math.max(0, pages.length - 1)) gamePage.value = 0;
});

const user = computed(() => {
  const profile = gamesResponse.value?.data.user;
  return {
    id: profile?.id ?? 0,
    nickName: profile?.nickName?.trim() || `使用者 #${idParam.value}`,
    userName: profile?.userName?.trim() || '',
    discordId: profile?.discordId?.trim() || '',
    avatar: profile?.avatar?.trim() || '',
    description: profile?.description?.trim() || '',
    createdAt: profile?.createdAt || '—',
    updatedAt: profile?.updatedAt || '—',
  };
});

const initials = computed(() => {
  const n = user.value.nickName.trim();
  return n ? n.slice(0, 1).toUpperCase() : '?';
});

function gameImage(ug: UserGameDto) {
  const image = ug.gameErogs?.image?.trim();
  return image || PLACEHOLDER_IMAGE_URL;
}

function gameTitle(ug: UserGameDto) {
  const name = ug.gameErogs?.name?.trim();
  return name || `Erogs #${ug.gameErogsId}`;
}

function gameMarks(ug: UserGameDto) {
  const marks: string[] = [];
  if (ug.wishListMark) marks.push('❤️');
  if (ug.blackListMark) marks.push('🚫');
  return marks.join(' ');
}

function isDone(ug: UserGameDto) {
  return ug.status === 'finished';
}

function statusLabel(ug: UserGameDto) {
  return ug.status === 'finished' ? '遊玩完畢' : ug.status;
}

function fmtLocalDate(input?: string | null) {
  if (!input || input === '—') return '—';
  const trimmed = input.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
</script>

<style scoped>
.view-toggle.v-btn-toggle {
  height: auto;
  padding: 3px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.view-toggle .view-toggle-btn.v-btn {
  border-radius: 999px !important;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.view-toggle .view-toggle-btn.v-btn--active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.game-view-stack {
  position: relative;
  overflow: hidden;
  contain: layout paint style;
}

.game-view-layer {
  width: 100%;
}

.game-table-panel {
  overflow-x: auto;
}

.game-img-placeholder {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

/* 左右滑動切換：往後（卡片→表格）新內容自右側進、舊內容往左離開 */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    opacity 0.26s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.slide-next-leave-active,
.slide-prev-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(32px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-32px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(32px);
}

.game-grid {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 16px;
  align-items: stretch;
}

.carousel-window {
  overflow: hidden;
}

.game-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  height: 100%;
}

.game-card:hover {
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
  transform: translateY(-2px);
}

.game-card--done {
  border-color: rgba(var(--v-theme-success), 0.55) !important;
  background: rgba(var(--v-theme-success), 0.1);
}

.game-title {
  overflow: hidden;
}

.game-title-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-name-td {
  max-width: 0;
  width: 38%;
}

.game-name-cell {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  min-width: 0;
}

.game-name-cell__marks {
  flex-shrink: 0;
}

.game-name-cell__title {
  min-width: 0;
  flex: 1 1 auto;
  max-width: 20rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.game-name-cell__id {
  flex-shrink: 0;
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 0.8125rem;
}

.game-meta-label {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 600;
}

.game-meta-value {
  text-align: right;
  word-break: break-word;
}

.empty-state,
.games-error-state {
  border-style: dashed;
}
</style>

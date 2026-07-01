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
                  <UserRoleChip :role="user.role" />
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
            <div v-if="!showPrivateGamesLock" class="d-flex align-center flex-wrap ga-2">
              <v-btn
                v-if="canEditProfile"
                color="primary"
                variant="tonal"
                class="text-none"
                prepend-icon="mdi-plus-circle-outline"
                @click="openGameCreateModal"
              >
                建檔
              </v-btn>
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
            v-if="showPrivateGamesLock"
            rounded="xl"
            border
            color="surface-variant"
            class="private-games-state pa-10 text-center"
          >
            <v-icon size="56" color="medium-emphasis" class="mb-4">mdi-lock-outline</v-icon>
            <p class="text-body-1 font-weight-medium mb-2">此使用者的遊戲資料已設為私人</p>
            <p class="text-body-2 text-medium-emphasis mb-0">
              該使用者已將個人建檔資料設為不公開，無法查看遊戲紀錄。
            </p>
          </v-sheet>

          <template v-else>
            <v-sheet
              v-if="userGames.length === 0 && !gamesPending"
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
                          :class="{ 'game-card--status': !!userGameStatusColor(ug.status) }"
                          :style="userGameStatusThemeStyle(ug.status)"
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
                                  :color="userGameStatusColor(ug.status)"
                                  variant="tonal"
                                >
                                  {{ userGameStatusLabel(ug.status) }}
                                </v-chip>
                              </div>
                            </v-card-subtitle>
                          </v-card-item>

                          <v-card-text class="pt-0 mt-auto">
                            <div class="game-meta">
                              <div class="game-meta-row">
                                <span class="game-meta-label">開始時間</span>
                                <span class="game-meta-value">{{
                                  fmtLocalDate(ug.startDate)
                                }}</span>
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
                  <Transition :name="slideName">
                    <div v-if="canEditProfile" class="table-edit-action d-flex justify-end mb-3">
                      <v-btn
                        :color="tableEditUnlocked ? 'primary' : undefined"
                        variant="tonal"
                        class="text-none table-edit-btn"
                        @click="toggleTableEdit"
                      >
                        <v-icon start>
                          {{ tableEditUnlocked ? 'mdi-lock-open-variant' : 'mdi-lock' }}
                        </v-icon>
                        修改
                      </v-btn>
                    </div>
                  </Transition>

                  <v-table density="comfortable" class="rounded border bg-surface game-table">
                    <thead>
                      <tr>
                        <th class="text-start">遊戲名稱</th>
                        <th class="text-start">狀態</th>
                        <th v-for="col in tableDateSortColumns" :key="col.key" class="text-start">
                          <button
                            type="button"
                            class="game-table-sort-btn"
                            @click="toggleTableSort(col.key)"
                          >
                            <span>{{ col.label }}</span>
                            <v-icon
                              size="14"
                              class="game-table-sort-icon"
                              :class="{
                                'game-table-sort-icon--active': tableSortKey === col.key,
                                'game-table-sort-icon--asc':
                                  tableSortKey === col.key && tableSortDir === 'asc',
                              }"
                            >
                              mdi-menu-down
                            </v-icon>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(ug, idx) in tableUserGames"
                        :key="`table-${ug.gameErogsId}-${idx}`"
                        class="game-table-row"
                        :class="{ 'game-table-row--clickable': tableEditUnlocked }"
                        @click="onTableRowClick(ug)"
                      >
                        <td class="game-name-td">
                          <div class="game-name-cell">
                            <span v-if="gameMarks(ug)" class="game-name-cell__marks">{{
                              gameMarks(ug)
                            }}</span>
                            <span class="game-name-cell__title" :title="gameTitle(ug)">{{
                              gameTitle(ug)
                            }}</span>
                          </div>
                        </td>
                        <td>
                          <v-chip
                            size="small"
                            :color="userGameStatusColor(ug.status)"
                            variant="tonal"
                          >
                            {{ userGameStatusLabel(ug.status) }}
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
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="gameCreateModalOpen" max-width="520" opacity="0.58" scroll-strategy="block">
      <v-card rounded="xl" variant="flat" color="surface" class="game-edit-dialog-card">
        <v-card-title class="text-h6">建立遊戲紀錄</v-card-title>
        <v-card-text>
          <form class="d-flex flex-column ga-4" @submit.prevent="onGameCreateSubmit">
            <v-autocomplete
              ref="gameCreateAutocompleteRef"
              v-model="gameCreateSelectedGame"
              v-model:search="gameAutocompleteSearch"
              :items="gameAutocompleteItems"
              :loading="gameAutocompleteLoading"
              class="game-create-autocomplete"
              label="遊戲"
              placeholder="輸入至少 2 個字搜尋"
              item-title="name"
              return-object
              clearable
              no-filter
              hide-details="auto"
              hint="輸入遊戲名稱搜尋"
              no-data-text="找不到符合的遊戲"
              persistent-hint
              :menu-props="gameAutocompleteMenuProps"
              @update:menu="onGameAutocompleteMenu"
              @click:clear="clearGameAutocomplete"
              @update:search="onGameAutocompleteSearch"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps" class="game-create-autocomplete-item">
                  <template #title>
                    <span class="game-create-autocomplete-item__title">
                      {{ gameOf(item).name }}
                    </span>
                  </template>
                  <template #subtitle>
                    <span class="game-create-autocomplete-item__subtitle">
                      ID：{{ gameOf(item).id }}
                    </span>
                  </template>
                  <template v-if="gameOf(item).category" #append>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      :color="erogsGameCategoryChipColor(gameOf(item).category)"
                      class="flex-shrink-0"
                    >
                      {{ gameOf(item).category }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <span class="game-create-selection">
                  <span class="game-create-selection__name">{{ gameOf(item).name }}</span>
                  <v-chip
                    v-if="gameOf(item).category"
                    size="x-small"
                    variant="tonal"
                    :color="erogsGameCategoryChipColor(gameOf(item).category)"
                    class="ms-2 flex-shrink-0"
                  >
                    {{ gameOf(item).category }}
                  </v-chip>
                </span>
              </template>
            </v-autocomplete>

            <v-select
              v-model="gameCreateForm.status"
              label="狀態"
              :items="USER_GAME_STATUS_OPTIONS"
              item-title="label"
              item-value="value"
              hide-details="auto"
            />

            <div class="d-flex flex-column ga-2">
              <v-switch
                v-model="gameCreateForm.wishListMark"
                label="願望清單"
                color="primary"
                hide-details
                density="compact"
              />
              <v-switch
                v-model="gameCreateForm.blackListMark"
                label="黑名單"
                color="primary"
                hide-details
                density="compact"
              />
            </div>

            <v-date-input
              v-model="gameCreateDates.startDate"
              label="開始時間"
              clearable
              hide-details="auto"
            />
            <v-date-input
              v-model="gameCreateDates.finishedDate"
              label="結束時間"
              clearable
              hide-details="auto"
              :error-messages="gameCreateDateRangeError"
            />

            <v-btn
              color="primary"
              type="submit"
              size="large"
              class="text-none align-self-end mt-2"
              :loading="gameCreateSubmitting"
              :disabled="gameCreateSubmitting || !!gameCreateDateRangeError"
            >
              確定建立
            </v-btn>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="gameCreateModalOpen = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="gameEditModalOpen" max-width="520" opacity="0.58" scroll-strategy="block">
      <v-card rounded="xl" variant="flat" color="surface" class="game-edit-dialog-card">
        <v-card-title class="text-h6">修改遊戲紀錄</v-card-title>
        <v-card-text v-if="tableEditGame">
          <form class="d-flex flex-column ga-4" @submit.prevent="onGameEditSubmit">
            <div>
              <div class="text-caption text-medium-emphasis mb-2">遊戲</div>
              <div class="d-flex align-center flex-wrap ga-2">
                <span class="text-body-1 font-weight-medium game-edit-title">{{
                  gameTitle(tableEditGame)
                }}</span>
                <v-chip size="small" variant="tonal" color="info" label>
                  ID：{{ tableEditGame.gameErogsId }}
                </v-chip>
              </div>
            </div>

            <v-select
              v-model="gameEditForm.status"
              label="狀態"
              :items="USER_GAME_STATUS_OPTIONS"
              item-title="label"
              item-value="value"
              hide-details="auto"
            />

            <div class="d-flex flex-column ga-2">
              <v-switch
                v-model="gameEditForm.wishListMark"
                label="願望清單"
                color="primary"
                hide-details
                density="compact"
              />
              <v-switch
                v-model="gameEditForm.blackListMark"
                label="黑名單"
                color="primary"
                hide-details
                density="compact"
              />
            </div>

            <v-date-input
              v-model="gameEditDates.startDate"
              label="開始時間"
              clearable
              hide-details="auto"
            />
            <v-date-input
              v-model="gameEditDates.finishedDate"
              label="結束時間"
              clearable
              hide-details="auto"
              :error-messages="gameEditDateRangeError"
            />

            <v-divider />

            <div class="d-flex flex-wrap ga-2 text-caption text-medium-emphasis">
              <span>建立：{{ fmtLocalDate(tableEditGame.createdAt) }}</span>
              <span>更新：{{ fmtLocalDate(tableEditGame.updatedAt) }}</span>
            </div>

            <v-btn
              color="primary"
              type="submit"
              size="large"
              class="text-none align-self-end mt-2"
              :loading="gameEditSubmitting"
              :disabled="gameEditSubmitting || !!gameEditDateRangeError"
            >
              確定更新
            </v-btn>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="gameEditModalOpen = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="gameEditSnackbar" :color="gameEditSnackbarColor" :timeout="3000">
      {{ gameEditSnackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { formatISO, isAfter } from 'date-fns';
import { authErrorMessage } from '~/composables/useAuth';
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import { erogsGameCategoryChipColor } from '~/utils/erogsGameCategory';
import { unwrapErogsAutocompleteItem } from '~/utils/erogsGameAutocompleteItem';
import {
  USER_GAME_STATUS,
  USER_GAME_STATUS_OPTIONS,
  userGameStatusColor,
  userGameStatusLabel,
  userGameStatusThemeStyle,
} from '~/utils/userGameStatus';
import { useDisplay } from 'vuetify';
import type {
  ApiResponse,
  FetchErrorLike,
  GetUserGameDto,
  UpdateUserGameBody,
  CreateUserGameBody,
  UserGameDto,
} from '~/types/user-api';
import type { ErogsGameAutocompleteItem } from '~/types/game-erogs-api';

const gameOf = unwrapErogsAutocompleteItem;

const PLACEHOLDER_IMAGE_URL = 'https://image.kurohelper.com/docs/neneGIF.gif';

type GameViewMode = 'card' | 'table';
type TableSortKey = 'startDate' | 'finishedDate' | 'createdAt' | 'updatedAt';
type TableSortDir = 'asc' | 'desc';

const tableDateSortColumns: { key: TableSortKey; label: string }[] = [
  { key: 'startDate', label: '開始時間' },
  { key: 'finishedDate', label: '結束時間' },
  { key: 'createdAt', label: '建立' },
  { key: 'updatedAt', label: '更新' },
];

const gameViewMode = ref<GameViewMode>('card');
const tableReady = ref(false);
const tableSortKey = ref<TableSortKey | null>(null);
const tableSortDir = ref<TableSortDir>('desc');
const tableEditUnlocked = ref(false);
const gameCreateModalOpen = ref(false);
const gameEditModalOpen = ref(false);
const tableEditGame = ref<UserGameDto | null>(null);
const gameEditSnackbar = ref(false);
const gameEditSnackbarText = ref('');
const gameEditSnackbarColor = ref<'success' | 'info' | 'error'>('info');
const gameEditSubmitting = ref(false);
const gameCreateSubmitting = ref(false);

type CreateUserGameForm = UpdateUserGameBody & {
  gameErogsId: number | null;
};

const emptyGameEditForm = (): UpdateUserGameBody => ({
  status: USER_GAME_STATUS.NONE,
  wishListMark: false,
  blackListMark: false,
  startDate: null,
  finishedDate: null,
});

const emptyGameCreateForm = (): CreateUserGameForm => ({
  gameErogsId: null,
  status: USER_GAME_STATUS.NONE,
  wishListMark: false,
  blackListMark: false,
  startDate: null,
  finishedDate: null,
});

const gameEditForm = reactive<UpdateUserGameBody>(emptyGameEditForm());
const gameCreateForm = reactive<CreateUserGameForm>(emptyGameCreateForm());
const gameCreateSelectedGame = ref<ErogsGameAutocompleteItem | null>(null);
const gameAutocompleteSearch = ref('');
const gameCreateAutocompleteRef = ref<{ $el: HTMLElement } | null>(null);
const gameAutocompleteMenuWidth = ref<number | undefined>(undefined);
const {
  items: gameAutocompleteItems,
  loading: gameAutocompleteLoading,
  search: onGameAutocompleteSearch,
  reset: resetGameAutocomplete,
} = useErogsGameAutocomplete();

function syncGameAutocompleteMenuWidth() {
  const root = gameCreateAutocompleteRef.value?.$el;
  const field = root?.querySelector('.v-field');
  if (field instanceof HTMLElement && field.offsetWidth > 0) {
    gameAutocompleteMenuWidth.value = field.offsetWidth;
  }
}

function onGameAutocompleteMenu(open: boolean) {
  if (!open) return;
  nextTick(() => {
    syncGameAutocompleteMenuWidth();
  });
}

const gameAutocompleteMenuProps = computed(() => {
  const width = gameAutocompleteMenuWidth.value;
  return {
    contentClass: 'v-select__content game-create-autocomplete-menu',
    ...(width ? { maxWidth: width, minWidth: width, width } : {}),
  };
});

function clearGameAutocomplete() {
  gameCreateSelectedGame.value = null;
  gameAutocompleteSearch.value = '';
  resetGameAutocomplete();
}

watch(gameCreateSelectedGame, (game, prev) => {
  gameCreateForm.gameErogsId = game?.id ?? null;
  if (prev && !game) {
    gameAutocompleteSearch.value = '';
    resetGameAutocomplete();
  }
});

type DateRangeForm = Pick<UpdateUserGameBody, 'startDate' | 'finishedDate'>;

const dateAdapter = useDate();

function bindIsoDateField(form: DateRangeForm, key: keyof DateRangeForm) {
  return computed({
    get(): Date | null {
      const raw = form[key]?.trim();
      if (!raw || !/^\d{4}-\d{2}-\d{2}/.test(raw)) return null;
      const date = dateAdapter.parseISO(raw.slice(0, 10)) as Date;
      return dateAdapter.isValid(date) ? date : null;
    },
    set(value: Date | null) {
      if (!value || !dateAdapter.isValid(value)) {
        form[key] = null;
        return;
      }
      form[key] = formatISO(value, { representation: 'complete' });
    },
  });
}

function bindIsoDateFields(form: DateRangeForm) {
  return {
    startDate: bindIsoDateField(form, 'startDate'),
    finishedDate: bindIsoDateField(form, 'finishedDate'),
  };
}

const gameEditDates = bindIsoDateFields(gameEditForm);
const gameCreateDates = bindIsoDateFields(gameCreateForm);

function dateRangeError(startDate: string | null, finishedDate: string | null) {
  const startRaw = startDate?.trim();
  const endRaw = finishedDate?.trim();
  if (!startRaw || !endRaw) return '';
  const start = new Date(startRaw);
  const end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  return isAfter(start, end) ? '開始時間不能超過結束時間' : '';
}

const gameEditDateRangeError = computed(() =>
  dateRangeError(gameEditForm.startDate, gameEditForm.finishedDate),
);

const gameCreateDateRangeError = computed(() =>
  dateRangeError(gameCreateForm.startDate, gameCreateForm.finishedDate),
);

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
  if (next !== 'table') {
    tableEditUnlocked.value = false;
    gameEditModalOpen.value = false;
    tableEditGame.value = null;
    tableSortKey.value = null;
    tableSortDir.value = 'desc';
  }
});

function toggleTableSort(key: TableSortKey) {
  if (tableSortKey.value === key) {
    tableSortDir.value = tableSortDir.value === 'desc' ? 'asc' : 'desc';
    return;
  }
  tableSortKey.value = key;
  tableSortDir.value = 'desc';
}

function closeGameEditModal() {
  gameEditModalOpen.value = false;
  tableEditGame.value = null;
  Object.assign(gameEditForm, emptyGameEditForm());
}

function openGameCreateModal() {
  Object.assign(gameCreateForm, emptyGameCreateForm());
  gameCreateSelectedGame.value = null;
  gameAutocompleteSearch.value = '';
  gameAutocompleteMenuWidth.value = undefined;
  resetGameAutocomplete();
  gameCreateModalOpen.value = true;
  nextTick(() => {
    syncGameAutocompleteMenuWidth();
  });
}

function closeGameCreateModal() {
  gameCreateModalOpen.value = false;
  gameCreateSelectedGame.value = null;
  gameAutocompleteSearch.value = '';
  resetGameAutocomplete();
  Object.assign(gameCreateForm, emptyGameCreateForm());
}

const onGameCreateSubmit = async () => {
  if (gameCreateDateRangeError.value) {
    showGameEditSnackbar(gameCreateDateRangeError.value, 'error');
    return;
  }
  const selectedGame = gameCreateSelectedGame.value;
  if (!selectedGame?.id) {
    showGameEditSnackbar('請選擇遊戲', 'error');
    return;
  }

  const body: CreateUserGameBody = {
    gameErogsId: selectedGame.id,
    status: gameCreateForm.status,
    wishListMark: gameCreateForm.wishListMark,
    blackListMark: gameCreateForm.blackListMark,
    startDate: gameCreateForm.startDate,
    finishedDate: gameCreateForm.finishedDate,
  };

  gameCreateSubmitting.value = true;
  try {
    await $fetch<ApiResponse<UserGameDto>>(`/api/user/${encodeURIComponent(idParam.value)}/game`, {
      method: 'POST',
      body,
    });
    await refreshGames();
    closeGameCreateModal();
    showGameEditSnackbar('遊戲紀錄已建立', 'success');
  } catch (err) {
    logApiError(err);
    showGameEditSnackbar(authErrorMessage(err, '建立失敗，請稍後再試'), 'error');
  } finally {
    gameCreateSubmitting.value = false;
  }
};

function fillGameEditForm(ug: UserGameDto) {
  gameEditForm.status = ug.status;
  gameEditForm.wishListMark = ug.wishListMark;
  gameEditForm.blackListMark = ug.blackListMark;
  gameEditForm.startDate = ug.startDate ?? null;
  gameEditForm.finishedDate = ug.finishedDate ?? null;
}

function showGameEditSnackbar(text: string, color: 'success' | 'info' | 'error' = 'info') {
  gameEditSnackbarText.value = text;
  gameEditSnackbarColor.value = color;
  gameEditSnackbar.value = true;
}

function toggleTableEdit() {
  tableEditUnlocked.value = !tableEditUnlocked.value;
  if (!tableEditUnlocked.value) closeGameEditModal();
}

function onTableRowClick(ug: UserGameDto) {
  if (!tableEditUnlocked.value) return;
  tableEditGame.value = ug;
  fillGameEditForm(ug);
  gameEditModalOpen.value = true;
}

const onGameEditSubmit = async () => {
  const game = tableEditGame.value;
  if (!game) return;
  if (gameEditDateRangeError.value) {
    showGameEditSnackbar(gameEditDateRangeError.value, 'error');
    return;
  }

  const body: UpdateUserGameBody = {
    status: gameEditForm.status,
    wishListMark: gameEditForm.wishListMark,
    blackListMark: gameEditForm.blackListMark,
    startDate: gameEditForm.startDate,
    finishedDate: gameEditForm.finishedDate,
  };

  gameEditSubmitting.value = true;
  try {
    await $fetch<ApiResponse<UserGameDto>>(
      `/api/user/${encodeURIComponent(idParam.value)}/game/${encodeURIComponent(String(game.gameErogsId))}`,
      { method: 'PUT', body },
    );
    await refreshGames();
    gameEditModalOpen.value = false;
    showGameEditSnackbar('遊戲紀錄已更新', 'success');
  } catch (err) {
    logApiError(err);
    showGameEditSnackbar(authErrorMessage(err, '更新失敗，請稍後再試'), 'error');
  } finally {
    gameEditSubmitting.value = false;
  }
};

watch(gameEditModalOpen, (open) => {
  if (!open) {
    tableEditGame.value = null;
    Object.assign(gameEditForm, emptyGameEditForm());
  }
});

watch(gameCreateModalOpen, (open) => {
  if (!open) {
    gameCreateSelectedGame.value = null;
    gameAutocompleteSearch.value = '';
    resetGameAutocomplete();
    Object.assign(gameCreateForm, emptyGameCreateForm());
  }
});

const { idParam, authUser, syncAuth, canEditProfile } = useUserProfileAccess();
await syncAuth();

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
    watch: [idParam, () => authUser.value?.id],
    server: false,
    default: () =>
      emptyApiResponse<GetUserGameDto>({
        user: {
          id: 0,
          nickName: '',
          discordId: '',
          avatar: '',
          description: '',
          privateGameData: false,
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

function parseSortTime(input?: string | null): number | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed === '—') return null;
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(trimmed);
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
}

function getTableSortTime(ug: UserGameDto, key: TableSortKey): number | null {
  switch (key) {
    case 'startDate':
      return parseSortTime(ug.startDate);
    case 'finishedDate':
      return parseSortTime(ug.finishedDate);
    case 'createdAt':
      return parseSortTime(ug.createdAt);
    case 'updatedAt':
      return parseSortTime(ug.updatedAt);
  }
}

const tableUserGames = computed(() => {
  const games = userGames.value;
  const key = tableSortKey.value;
  if (!key) return games;

  const dir = tableSortDir.value;
  return [...games].sort((a, b) => {
    const ta = getTableSortTime(a, key);
    const tb = getTableSortTime(b, key);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return dir === 'asc' ? ta - tb : tb - ta;
  });
});

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
    privateGameData: profile?.privateGameData ?? false,
    role: profile?.role ?? 0,
    createdAt: profile?.createdAt || '—',
    updatedAt: profile?.updatedAt || '—',
  };
});

const showPrivateGamesLock = computed(() => user.value.privateGameData && !canEditProfile.value);

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

.game-table-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: inherit;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.game-table-sort-btn:hover .game-table-sort-icon {
  color: rgb(var(--v-theme-primary));
}

.game-table-sort-icon {
  color: rgba(var(--v-theme-on-surface), 0.45);
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

.game-table-sort-icon--active {
  color: rgb(var(--v-theme-primary));
}

.game-table-sort-icon--asc {
  transform: rotate(180deg);
}

.table-edit-action {
  overflow: hidden;
}

.table-edit-btn {
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.game-table .game-table-row {
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.game-table-row--clickable {
  cursor: pointer;
}

.game-table-row--clickable:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  box-shadow:
    inset 0 0 0 1px rgba(var(--v-theme-primary), 0.45),
    0 0 18px rgba(var(--v-theme-primary), 0.28);
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

.game-card--status {
  border-color: rgba(var(--status-rgb), 0.55) !important;
  background: rgba(var(--status-rgb), 0.1);
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

.game-edit-title {
  word-break: break-word;
}

.game-create-autocomplete :deep(.v-field__input) {
  flex-wrap: nowrap;
  overflow: hidden;
}

.game-create-autocomplete :deep(.v-autocomplete__selection) {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.game-create-selection {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.game-create-selection__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style>
.game-edit-dialog-card.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45) !important;
}

.v-theme--light .game-edit-dialog-card.v-card {
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18) !important;
}

.game-create-autocomplete-menu.v-overlay__content {
  overflow: hidden;
  box-sizing: border-box;
}

.game-create-autocomplete-menu .v-virtual-scroll,
.game-create-autocomplete-menu .v-list {
  width: 100%;
  max-width: 100%;
}

.game-create-autocomplete-menu .v-list-item {
  max-width: 100%;
}

.game-create-autocomplete-menu .v-list-item__content {
  min-width: 0 !important;
  overflow: hidden;
}

.game-create-autocomplete-menu .game-create-autocomplete-item__title,
.game-create-autocomplete-menu .game-create-autocomplete-item__subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

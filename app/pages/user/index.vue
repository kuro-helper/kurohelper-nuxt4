<template>
  <v-container max-width="lg" class="py-8 px-4">
    <section class="finished-games mb-8">
      <div class="d-flex flex-wrap align-center ga-2 mb-4">
        <h2 class="text-h6 font-weight-bold mb-0">最近遊玩完畢</h2>
        <template v-if="finishedPages.length > 1">
          <v-btn
            icon="mdi-chevron-left"
            variant="tonal"
            size="small"
            rounded="xl"
            :disabled="finishedPage <= 0"
            @click="finishedPage--"
          />
          <span class="text-body-2 text-medium-emphasis text-no-wrap">
            {{ finishedPage + 1 }} / {{ finishedPages.length }}
          </span>
          <v-btn
            icon="mdi-chevron-right"
            variant="tonal"
            size="small"
            rounded="xl"
            :disabled="finishedPage >= finishedPages.length - 1"
            @click="finishedPage++"
          />
        </template>
      </div>

      <div v-if="finishedPending" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <LoadErrorState
        v-else-if="finishedFailed"
        :message="finishedErrorMessage"
        detail="無法載入最近遊玩完畢，請稍後再試。"
        @retry="refreshFinished()"
      />

      <v-sheet
        v-else-if="finishedGames.length === 0"
        rounded="xl"
        border
        color="surface-variant"
        class="finished-games-state pa-6 text-center"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">尚無遊玩完畢的遊戲。</p>
      </v-sheet>

      <v-window v-else v-model="finishedPage" class="finished-games__window" :touch="false">
        <v-window-item
          v-for="(page, pageIndex) in finishedPages"
          :key="`finished-page-${pageIndex}`"
        >
          <div
            class="finished-games__grid"
            :style="{ gridTemplateColumns: `repeat(${finishedColumns}, minmax(0, 1fr))` }"
          >
            <v-card
              v-for="game in page"
              :key="`${game.userId}-${game.gameErogsId}`"
              rounded="xl"
              variant="outlined"
              class="finished-games__card"
              :to="`/game/${game.gameErogsId}`"
            >
              <v-img :src="finishedGameImage(game)" height="96" cover class="finished-games__image">
                <template #placeholder>
                  <div class="fill-height finished-games__placeholder" />
                </template>
              </v-img>
              <div class="pa-2">
                <div class="finished-games__name text-caption font-weight-bold">
                  {{ game.gameErogs?.name }}
                </div>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  label
                  class="finished-games__brand mt-1"
                >
                  {{ game.gameErogs?.brandErogs?.name }}
                </v-chip>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ game.nickName?.trim() || '未紀錄' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ finishedGameDate(game) }}
                </div>
              </div>
            </v-card>
          </div>
        </v-window-item>
      </v-window>
    </section>

    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">使用者列表</h1>
        <div v-if="!usersPending && !usersFailed" class="d-flex flex-wrap align-center ga-3">
          <p class="text-body-2 text-medium-emphasis mb-0">
            共 {{ filteredUsers.length }} 位使用者
          </p>
          <v-select
            v-model="roleFilter"
            :items="roleFilterItems"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            class="user-role-filter"
            aria-label="依使用者類別篩選"
          />
        </div>
      </div>
    </div>

    <div v-if="usersPending" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <LoadErrorState
      v-else-if="usersFailed"
      :message="usersErrorMessage"
      detail="無法載入使用者列表，請稍後再試。"
      @retry="refreshUsers()"
    />

    <v-sheet
      v-else-if="users.length === 0"
      rounded="xl"
      border
      color="surface-variant"
      class="empty-state pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">尚無使用者資料。</p>
    </v-sheet>

    <v-sheet
      v-else-if="filteredUsers.length === 0"
      rounded="xl"
      border
      color="surface-variant"
      class="empty-state pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">此類別尚無使用者。</p>
    </v-sheet>

    <div v-else>
      <section
        v-for="section in userSections"
        :key="section.key"
        class="user-section"
        :class="{ 'user-section--last': section.key === 'user' }"
      >
        <div class="user-section__heading mb-4">
          <h2 class="user-section__title text-subtitle-1 font-weight-bold">{{ section.title }}</h2>
          <v-chip class="user-section__count" size="small" variant="tonal" label>
            {{ section.items.length }} 位
          </v-chip>
        </div>

        <v-row density="comfortable">
          <v-col v-for="item in section.items" :key="item.id" cols="12" sm="6" md="4" lg="3">
            <v-card
              rounded="xl"
              variant="outlined"
              class="user-card h-100"
              :to="`/user/${item.id}`"
            >
              <v-card-text class="pa-3 d-flex align-center ga-3">
                <v-avatar size="56" rounded="lg" class="user-card__avatar">
                  <v-img v-if="item.avatar" :src="item.avatar" :alt="item.nickName" cover />
                  <span v-else class="text-h6 font-weight-bold">{{ userInitials(item) }}</span>
                </v-avatar>

                <div class="user-card__meta min-w-0">
                  <div
                    class="user-card__name text-subtitle-1 font-weight-bold"
                    :title="item.nickName"
                  >
                    {{ item.nickName || '—' }}
                  </div>
                  <UserRoleChip :role="item.role" size="x-small" class="mt-1" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import { formatUserGameDate } from '~/utils/userGameDate';
import { isUserRoleDeveloper, isUserRoleOwner, USER_ROLE, userRoleLabel } from '~/utils/userRole';
import type { ApiResponse, FetchErrorLike, FinishedUserGame, UserItem } from '~/types/user-api';

const PLACEHOLDER_IMAGE_URL = 'https://cdn.kurohelper.com/docs/neneGIF.gif';

const emptyFinishedResponse = (): ApiResponse<FinishedUserGame[]> => ({
  message: '',
  data: [],
});

const {
  data: finishedResponse,
  pending: finishedPending,
  error: finishedError,
  status: finishedStatus,
  refresh: refreshFinished,
} = useFetch<ApiResponse<FinishedUserGame[]>, FetchErrorLike>(
  '/api/statistics/user-game/finished',
  {
    default: emptyFinishedResponse,
  },
);

watch(finishedError, (err) => {
  if (err) logApiError(err);
});

const finishedFailed = computed(() => finishedStatus.value === 'error');
const finishedErrorMessage = computed(() =>
  finishedError.value ? apiErrorUserMessage(finishedError.value) : '請稍後再試。',
);

const finishedGames = computed(() => finishedResponse.value?.data ?? []);

const finishedPage = ref(0);
const display = useDisplay();
const finishedColumns = computed(() => (display.lgAndUp.value ? 6 : 3));
const finishedPages = computed(() => {
  const size = finishedColumns.value;
  const items = finishedGames.value;
  const pages: FinishedUserGame[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
});

watch(finishedPages, (pages) => {
  if (finishedPage.value > Math.max(0, pages.length - 1)) finishedPage.value = 0;
});

function finishedGameImage(game: FinishedUserGame) {
  return game.gameErogs?.image?.trim() || PLACEHOLDER_IMAGE_URL;
}

function finishedDatePart(input?: string | null) {
  const date = formatUserGameDate(input);
  return !input || date === '—' ? '-' : date;
}

function finishedGameDate(game: FinishedUserGame) {
  return `${finishedDatePart(game.startDate)}到${finishedDatePart(game.finishedDate)}`;
}

const emptyApiResponse = (): ApiResponse<UserItem[]> => ({
  message: '',
  data: [],
});

const {
  data: usersResponse,
  pending: usersPending,
  error: usersError,
  status: usersStatus,
  refresh: refreshUsers,
} = useFetch<ApiResponse<UserItem[]>, FetchErrorLike>('/api/user', {
  default: emptyApiResponse,
});

watch(usersError, (err) => {
  if (err) logApiError(err);
});

const usersFailed = computed(() => usersStatus.value === 'error');
const usersErrorMessage = computed(() =>
  usersError.value ? apiErrorUserMessage(usersError.value) : '請稍後再試。',
);

const users = computed(() => [...(usersResponse.value?.data ?? [])].sort((a, b) => a.id - b.id));

type RoleFilter = 'all' | 'owner' | 'developer' | 'user';

const roleFilter = ref<RoleFilter>('all');

const roleFilterItems: { title: string; value: RoleFilter }[] = [
  { title: '全部', value: 'all' },
  { title: userRoleLabel(USER_ROLE.OWNER), value: 'owner' },
  { title: userRoleLabel(USER_ROLE.DEVELOPER), value: 'developer' },
  { title: userRoleLabel(USER_ROLE.USER), value: 'user' },
];

const filteredUsers = computed(() => {
  const filter = roleFilter.value;
  if (filter === 'owner') return users.value.filter((u) => isUserRoleOwner(u.role));
  if (filter === 'developer') return users.value.filter((u) => isUserRoleDeveloper(u.role));
  if (filter === 'user') {
    return users.value.filter((u) => !isUserRoleOwner(u.role) && !isUserRoleDeveloper(u.role));
  }
  return users.value;
});

const sortById = (a: UserItem, b: UserItem) => a.id - b.id;

const userSections = computed(() => {
  const owners = filteredUsers.value.filter((u) => isUserRoleOwner(u.role)).sort(sortById);
  const developers = filteredUsers.value.filter((u) => isUserRoleDeveloper(u.role)).sort(sortById);
  const regular = filteredUsers.value
    .filter((u) => !isUserRoleOwner(u.role) && !isUserRoleDeveloper(u.role))
    .sort(sortById);

  return [
    { key: 'owner', title: userRoleLabel(USER_ROLE.OWNER), items: owners },
    { key: 'developer', title: userRoleLabel(USER_ROLE.DEVELOPER), items: developers },
    { key: 'user', title: userRoleLabel(USER_ROLE.USER), items: regular },
  ].filter((section) => section.items.length > 0);
});

function userInitials(item: UserItem) {
  const name = item.nickName?.trim() || '';
  return name ? name.slice(0, 1).toUpperCase() : '?';
}
</script>

<style scoped>
.user-role-filter {
  width: 148px;
  max-width: 100%;
  flex: 0 0 auto;
}

.user-role-filter :deep(.v-field__input) {
  font-size: 0.875rem;
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
}

.user-section {
  margin-bottom: 2rem;
}

.user-section__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.user-section__title {
  margin: 0;
  display: flex;
  align-items: center;
  min-height: 24px;
  line-height: 1;
}

.user-section__count {
  margin: 0;
}

.user-section--last {
  margin-bottom: 0;
}

.user-card {
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
  border-color: rgba(var(--v-theme-primary), 0.45) !important;
}

.user-card__avatar {
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgba(var(--v-theme-surface-variant), 0.6);
}

.user-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-card__name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.finished-games__window {
  overflow: hidden;
}

.finished-games__grid {
  display: grid;
  gap: 12px;
  align-items: stretch;
}

.finished-games__card {
  height: 100%;
  overflow: hidden;
  text-decoration: none;
}

.finished-games__image {
  border-radius: 12px 12px 0 0;
}

.finished-games__name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  min-height: calc(1.35em * 2);
}

.finished-games__brand {
  max-width: 100%;
}

.finished-games__brand :deep(.v-chip__content) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.finished-games__placeholder {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.empty-state,
.finished-games-state {
  border-style: dashed;
}
</style>

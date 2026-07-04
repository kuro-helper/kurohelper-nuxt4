<template>
  <v-container max-width="lg" class="py-8 px-4">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">使用者列表</h1>
        <p v-if="!usersPending && !usersFailed" class="text-body-2 text-medium-emphasis mb-0">
          共 {{ users.length }} 位使用者
        </p>
      </div>
    </div>

    <div v-if="usersPending" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <v-sheet
      v-else-if="usersFailed"
      rounded="xl"
      border
      color="surface-variant"
      class="users-error-state pa-8 text-center"
    >
      <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 font-weight-medium mb-2">{{ usersErrorMessage }}</p>
      <p class="text-body-2 text-medium-emphasis mb-4">無法載入使用者列表，請稍後再試。</p>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshUsers()">
        重試
      </v-btn>
    </v-sheet>

    <v-sheet
      v-else-if="users.length === 0"
      rounded="xl"
      border
      color="surface-variant"
      class="empty-state pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">尚無使用者資料。</p>
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
              <v-card-text class="pa-4 d-flex flex-column align-center text-center">
                <v-avatar size="72" rounded="lg" class="user-card__avatar mb-3">
                  <v-img v-if="item.avatar" :src="item.avatar" :alt="item.nickName" cover />
                  <span v-else class="text-h5 font-weight-bold">{{ userInitials(item) }}</span>
                </v-avatar>

                <div
                  class="user-card__name text-subtitle-1 font-weight-bold mb-2"
                  :title="item.nickName"
                >
                  {{ item.nickName || '—' }}
                </div>

                <!-- <v-chip
                  v-if="item.discordId"
                  size="small"
                  color="primary"
                  variant="tonal"
                  label
                  class="mb-2"
                >
                  {{ item.discordId }}
                </v-chip>
                <v-chip v-else size="small" color="error" variant="tonal" label class="mb-2">
                  尚未綁定 Discord
                </v-chip> -->

                <UserRoleChip :role="item.role" size="x-small" />
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
import { isUserRoleDeveloper, isUserRoleOwner, USER_ROLE, userRoleLabel } from '~/utils/userRole';
import type { ApiResponse, FetchErrorLike, UserItem } from '~/types/user-api';

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

const sortById = (a: UserItem, b: UserItem) => a.id - b.id;

const userSections = computed(() => {
  const owners = users.value.filter((u) => isUserRoleOwner(u.role)).sort(sortById);
  const developers = users.value.filter((u) => isUserRoleDeveloper(u.role)).sort(sortById);
  const regular = users.value
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
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgba(var(--v-theme-surface-variant), 0.6);
}

.user-card__name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state,
.users-error-state {
  border-style: dashed;
}
</style>

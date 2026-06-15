<template>
  <v-container max-width="lg" class="py-8 px-4">
    <v-card variant="outlined" class="rounded-xl overflow-hidden user-list-card">
      <v-card-text class="pa-6 pa-md-8">
        <div class="text-h5 font-weight-bold mb-6">使用者列表</div>

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

        <v-table v-else density="comfortable" class="rounded border bg-surface">
          <thead>
            <tr>
              <th class="text-start">使用者名稱</th>
              <th class="text-start">Discord ID</th>
              <th class="text-start">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in users"
              :key="item.id"
              class="user-row"
              @click="navigateTo(`/user/${item.id}`)"
            >
              <td class="font-weight-medium">{{ item.name || '—' }}</td>
              <td>
                <v-chip v-if="item.discordId" size="small" color="primary" variant="tonal" label>
                  {{ item.discordId }}
                </v-chip>
                <v-chip v-else size="small" color="error" variant="tonal" label>
                  尚未綁定 Discord
                </v-chip>
              </td>
              <td>{{ item.role }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
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
</script>

<style scoped>
.user-list-card {
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.015) 100%
  );
}

.user-row {
  cursor: pointer;
}

.user-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.empty-state,
.users-error-state {
  border-style: dashed;
}
</style>

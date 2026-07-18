<template>
  <v-container max-width="md" class="py-8 px-4">
    <v-card variant="outlined" class="rounded-xl pa-6 pa-md-8">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">刪除公告</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">刪除後無法復原</p>
        </div>
        <v-btn variant="text" class="text-none" to="/announcement/create">建立公告</v-btn>
      </div>

      <div v-if="pending" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>

      <v-sheet v-else-if="error" rounded="lg" border class="pa-6 text-center">
        <p class="text-body-2 mb-4">{{ authErrorMessage(error, '載入失敗') }}</p>
        <v-btn variant="tonal" color="primary" class="text-none" @click="refresh()">重試</v-btn>
      </v-sheet>

      <v-sheet v-else-if="items.length === 0" rounded="lg" border class="pa-6 text-center">
        <p class="text-body-2 text-medium-emphasis mb-0">目前沒有公告</p>
      </v-sheet>

      <div v-else class="d-flex flex-column ga-3">
        <div v-for="item in items" :key="item.id" class="delete-row">
          <v-avatar size="36" rounded="lg" class="delete-row__icon">
            <v-icon size="20" color="primary">{{ item.icon || 'mdi-bullhorn-outline' }}</v-icon>
          </v-avatar>
          <div class="delete-row__body min-w-0">
            <div class="text-body-2 font-weight-medium text-truncate">{{ item.title }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.category }} · {{ fmtDate(item.createdAt) }}
            </div>
          </div>
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            color="error"
            size="small"
            :loading="deletingId === item.id"
            :disabled="deletingId !== null"
            aria-label="刪除公告"
            @click="confirmDelete(item)"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="confirmOpen" max-width="400" opacity="0.58">
      <v-card rounded="xl" variant="flat" color="surface">
        <v-card-title class="text-subtitle-1 font-weight-bold">確認刪除</v-card-title>
        <v-card-text> 確定要刪除「{{ target?.title }}」嗎？此操作無法復原。 </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="deletingId !== null"
            @click="confirmOpen = false"
          >
            取消
          </v-btn>
          <v-btn color="error" class="text-none" :loading="deletingId !== null" @click="doDelete">
            刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="2200">{{
      snackbarText
    }}</v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { authErrorMessage } from '~/composables/useAuth';
import type { AnnouncementItem, AnnouncementListResponse } from '~/types/announcement-api';
import type { ApiResponse } from '~/types/user-api';
import { isUserRoleStaff } from '~/utils/userRole';

definePageMeta({ middleware: 'staff' });

useSeoMeta({
  title: '刪除公告',
  robots: 'noindex, nofollow, noarchive',
});

const { user, refresh: refreshAuth } = useAuth();
await refreshAuth();
if (!user.value || !isUserRoleStaff(user.value.role)) {
  throw createError({ statusCode: 403, statusMessage: '權限不足', fatal: true });
}

const { data, pending, error, refresh } = await useFetch<AnnouncementListResponse>(
  '/api/announcement',
  {
    default: () => ({ message: '', data: [] }),
  },
);

const items = computed(() => data.value?.data ?? []);
const confirmOpen = ref(false);
const target = ref<AnnouncementItem | null>(null);
const deletingId = ref<number | null>(null);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

function fmtDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function confirmDelete(item: AnnouncementItem) {
  target.value = item;
  confirmOpen.value = true;
}

async function doDelete() {
  const item = target.value;
  if (!item || deletingId.value !== null) return;

  deletingId.value = item.id;
  try {
    await $fetch<ApiResponse<null>>(`/api/announcement/${item.id}`, { method: 'DELETE' });
    confirmOpen.value = false;
    target.value = null;
    snackbarColor.value = 'success';
    snackbarText.value = '已刪除';
    snackbar.value = true;
    await refresh();
  } catch (err) {
    snackbarColor.value = 'error';
    snackbarText.value = authErrorMessage(err, '刪除失敗');
    snackbar.value = true;
  } finally {
    deletingId.value = null;
  }
}
</script>

<style scoped>
.delete-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.5);
  background: rgba(var(--v-theme-surface-variant), 0.35);
}

.delete-row__icon {
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-theme-outline), 0.4);
  background: rgba(var(--v-theme-primary), 0.12);
}

.delete-row__body {
  flex: 1 1 0;
}
</style>

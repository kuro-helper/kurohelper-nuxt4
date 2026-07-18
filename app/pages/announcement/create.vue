<template>
  <v-container max-width="md" class="py-8 px-4">
    <v-card variant="outlined" class="rounded-xl pa-6 pa-md-8">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">建立公告</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">內文支援 Markdown</p>
        </div>
        <v-btn variant="text" class="text-none" to="/">回首頁</v-btn>
      </div>

      <form class="d-flex flex-column ga-5" @submit.prevent="onSubmit">
        <v-text-field
          v-model="form.category"
          label="分類"
          placeholder="例如：維護、更新、活動"
          hide-details="auto"
          :disabled="submitting"
        />

        <v-text-field
          v-model="form.title"
          label="標題"
          placeholder="列表上顯示的標題"
          hide-details="auto"
          :disabled="submitting"
        />

        <v-textarea
          v-model="form.content"
          label="內文（Markdown）"
          rows="10"
          auto-grow
          hide-details="auto"
          :disabled="submitting"
        />

        <div>
          <div class="text-body-2 mb-2">網頁 Icon（選填）</div>
          <div class="icon-picker">
            <v-btn
              v-for="opt in iconOptions"
              :key="opt.value"
              :icon="opt.value"
              :variant="form.icon === opt.value ? 'flat' : 'tonal'"
              :color="form.icon === opt.value ? 'primary' : undefined"
              :aria-label="opt.label"
              :aria-pressed="form.icon === opt.value"
              :disabled="submitting"
              @click="toggleIcon(opt.value)"
            />
          </div>
          <p class="text-caption text-medium-emphasis mt-2 mb-0">
            {{ selectedIconLabel }}
          </p>
        </div>

        <v-text-field
          v-model="form.thumbnail"
          label="Discord 側邊小圖 URL（選填）"
          placeholder="https://..."
          hide-details="auto"
          :disabled="submitting"
        />

        <v-text-field
          v-model="form.image"
          label="Discord／詳細大圖 URL（選填）"
          placeholder="https://..."
          hide-details="auto"
          :disabled="submitting"
        />

        <div v-if="form.content.trim()" class="preview-block">
          <div class="text-caption text-medium-emphasis mb-2">內文預覽</div>
          <v-sheet rounded="lg" border class="pa-4">
            <MarkdownContent :source="form.content" />
          </v-sheet>
        </div>

        <v-alert v-if="submitError" type="error" variant="tonal" density="compact">
          {{ submitError }}
        </v-alert>

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" class="text-none" :disabled="submitting" to="/">取消</v-btn>
          <v-btn
            color="primary"
            type="submit"
            class="text-none"
            :loading="submitting"
            :disabled="submitting || !canSubmit"
          >
            發布公告
          </v-btn>
        </div>
      </form>
    </v-card>

    <v-snackbar v-model="snackbar" color="success" :timeout="2500">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { authErrorMessage } from '~/composables/useAuth';
import type { CreateAnnouncementBody, CreateAnnouncementResponse } from '~/types/announcement-api';
import { isUserRoleStaff } from '~/utils/userRole';

definePageMeta({
  middleware: 'staff',
});

useSeoMeta({
  title: '建立公告',
  robots: 'noindex, nofollow, noarchive',
});

const { user, refresh } = useAuth();
const router = useRouter();

// 進頁再檢查一次（middleware 已 refresh；此處防狀態被改動）
await refresh();
if (!user.value || !isUserRoleStaff(user.value.role)) {
  throw createError({
    statusCode: 403,
    statusMessage: '權限不足',
    fatal: true,
  });
}

const form = reactive({
  category: '',
  title: '',
  content: '',
  icon: 'mdi-bullhorn-outline',
  thumbnail: '',
  image: '',
});

const iconOptions = [
  { value: 'mdi-bullhorn-outline', label: '公告' },
  { value: 'mdi-wrench-outline', label: '維護' },
  { value: 'mdi-update', label: '更新' },
  { value: 'mdi-calendar-star', label: '活動' },
  { value: 'mdi-alert-circle-outline', label: '提醒' },
] as const;

const selectedIconLabel = computed(() => {
  const hit = iconOptions.find((o) => o.value === form.icon);
  return hit ? `已選：${hit.label}` : '未選擇圖示';
});

function toggleIcon(value: string) {
  form.icon = form.icon === value ? '' : value;
}

const submitting = ref(false);
const submitError = ref('');
const snackbar = ref(false);
const snackbarText = ref('公告已建立');

const canSubmit = computed(
  () =>
    form.category.trim().length > 0 &&
    form.title.trim().length > 0 &&
    form.content.trim().length > 0,
);

function optionalField(value: string): string | null {
  const v = value.trim();
  return v ? v : null;
}

async function onSubmit() {
  if (!canSubmit.value || submitting.value) return;

  submitError.value = '';
  submitting.value = true;

  const body: CreateAnnouncementBody = {
    category: form.category.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    icon: optionalField(form.icon),
    thumbnail: optionalField(form.thumbnail),
    image: optionalField(form.image),
  };

  try {
    await $fetch<CreateAnnouncementResponse>('/api/announcement', {
      method: 'POST',
      body,
    });
    snackbar.value = true;
    snackbarText.value = '公告已建立';
    form.category = '';
    form.title = '';
    form.content = '';
    form.icon = '';
    form.thumbnail = '';
    form.image = '';
    await router.push('/');
  } catch (err) {
    submitError.value = authErrorMessage(err, '建立失敗，請稍後再試');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.preview-block {
  min-width: 0;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

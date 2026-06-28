<template>
  <v-container max-width="md" class="py-8 px-4">
    <v-card variant="outlined" class="rounded-xl pa-6 pa-md-8">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-6">
        <h1 class="text-h5 font-weight-bold">修改個人資料</h1>
        <v-btn variant="text" class="text-none" :to="`/user/${idParam}`">返回個人頁</v-btn>
      </div>

      <v-sheet
        v-if="!canEditProfile"
        rounded="xl"
        border
        color="surface-variant"
        class="pa-8 text-center"
      >
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <p class="text-body-1 font-weight-medium mb-4">無法修改個人資料</p>
        <v-btn color="primary" variant="tonal" class="text-none" :to="`/user/${idParam}`">
          返回個人頁
        </v-btn>
      </v-sheet>

      <div v-else-if="profilePending" class="d-flex justify-center py-16">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>

      <v-sheet
        v-else-if="profileFailed"
        rounded="xl"
        border
        color="surface-variant"
        class="pa-8 text-center"
      >
        <p class="text-body-1 font-weight-medium mb-4">{{ profileErrorMessage }}</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="refreshProfile()">
          重試
        </v-btn>
      </v-sheet>

      <form v-else class="d-flex flex-column ga-6" @submit.prevent="onSubmit">
        <div class="d-flex flex-column align-center ga-3">
          <v-avatar size="120" rounded="lg" class="avatar-display">
            <v-img v-if="displayAvatar" :src="displayAvatar" alt="" cover />
            <span v-else class="text-h3">{{ initials }}</span>
          </v-avatar>
        </div>

        <v-text-field
          v-model="form.avatar"
          label="大頭照 URL"
          placeholder="https://..."
          hide-details="auto"
        />

        <v-text-field
          v-if="authUser?.userName"
          :model-value="authUser.userName"
          label="登入帳號"
          readonly
          hide-details="auto"
        />

        <v-text-field v-model="form.nickName" label="暱稱" hide-details="auto" />
        <v-textarea
          v-model="form.description"
          label="說明／簡介"
          rows="4"
          auto-grow
          hide-details="auto"
        />

        <v-btn
          color="primary"
          type="submit"
          size="large"
          class="text-none align-self-end"
          :loading="submitting"
          :disabled="submitting"
        >
          確定更新
        </v-btn>
      </form>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { validateAvatarUrlReachable } from '~/utils/avatarUrl';
import { apiErrorUserMessage, logApiError } from '~/utils/apiError';
import { authErrorMessage } from '~/composables/useAuth';
import type {
  ApiResponse,
  FetchErrorLike,
  GetUserGameDto,
  UpdateUserBody,
  UserProfileDto,
} from '~/types/user-api';

const { idParam, authUser, refreshAuth, syncAuth, canEditProfile } = useUserProfileAccess();
await syncAuth();

const emptyApiResponse = <T,>(data: T): ApiResponse<T> => ({
  message: '',
  data,
});

const {
  data: profileResponse,
  pending: profilePending,
  error: profileError,
  status: profileStatus,
  refresh: refreshProfile,
} = useFetch<ApiResponse<GetUserGameDto>, FetchErrorLike>(
  () => `/api/user/${encodeURIComponent(idParam.value)}/game`,
  {
    watch: [idParam],
    immediate: false,
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

watch(
  canEditProfile,
  (allowed) => {
    if (allowed) refreshProfile();
  },
  { immediate: true },
);

watch(profileError, (err) => {
  if (err) logApiError(err);
});

const profileFailed = computed(() => profileStatus.value === 'error');
const profileErrorMessage = computed(() =>
  profileError.value ? apiErrorUserMessage(profileError.value) : '無法載入使用者資料，請稍後再試。',
);

const form = reactive({
  nickName: '',
  description: '',
  avatar: '',
});

const submitting = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error'>('success');

watch(
  () => profileResponse.value?.data.user,
  (profile) => {
    if (!profile) return;
    form.nickName = profile.nickName?.trim() ?? '';
    form.description = profile.description?.trim() ?? '';
    form.avatar = profile.avatar?.trim() ?? '';
  },
  { immediate: true },
);

const displayAvatar = computed(() => form.avatar.trim());

const initials = computed(() => {
  const n = profileResponse.value?.data.user.nickName?.trim() || '';
  return n ? n.slice(0, 1).toUpperCase() : '?';
});

const showSnackbar = (text: string, color: 'success' | 'error') => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const onSubmit = async () => {
  const nickName = form.nickName.trim();
  if (!nickName) {
    showSnackbar('暱稱不可為空', 'error');
    return;
  }

  const avatar = form.avatar.trim();

  submitting.value = true;
  try {
    const avatarError = await validateAvatarUrlReachable(avatar);
    if (avatarError) {
      showSnackbar(avatarError, 'error');
      return;
    }

    const body: UpdateUserBody = {
      nickName,
      description: form.description.trim(),
      avatar,
    };

    await $fetch<ApiResponse<UserProfileDto>>(`/api/user/${encodeURIComponent(idParam.value)}`, {
      method: 'PUT',
      body,
    });

    await refreshAuth();
    await refreshProfile();
    showSnackbar('個人資料已更新', 'success');
  } catch (err) {
    logApiError(err);
    showSnackbar(authErrorMessage(err, '更新失敗，請稍後再試'), 'error');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.avatar-display {
  border: 2px solid rgba(var(--v-theme-outline), 0.5);
}
</style>

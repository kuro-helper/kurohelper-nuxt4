<template>
  <v-container class="py-6 py-md-8" max-width="sm">
    <v-card rounded="xl" variant="outlined">
      <v-card-text class="pa-6">
        <div class="mb-4">
          <h2 class="text-h5 font-weight-bold">申辦帳號</h2>
          <p class="text-body-2 text-medium-emphasis mt-1">邀請 ID：{{ invitationId }}</p>
        </div>

        <div v-if="lookupState.status === 'loading'" class="d-flex align-center ga-2 py-2">
          <v-progress-circular indeterminate size="18" width="2" />
          <span class="text-body-2 text-medium-emphasis">正在驗證邀請資料...</span>
        </div>

        <v-alert
          v-else-if="lookupState.status === 'not-found'"
          type="error"
          variant="tonal"
          class="my-2"
        >
          找不到對應的邀請 ID，請確認連結是否正確。
        </v-alert>

        <template v-else-if="lookupState.status === 'ready'">
          <v-alert type="info" variant="tonal" class="mb-4">
            已驗證成功，綁定 Discord ID：{{ lookupState.discordId }}
          </v-alert>

          <form class="register-credentials" @submit.prevent="handleCredentialSubmit">
            <div class="d-flex flex-column ga-4">
              <v-text-field
                v-model.trim="accountName"
                class="register-field"
                autocomplete="username"
                label="帳號名稱"
                :error-messages="displayAccountErr"
                persistent-hint
                :hint="touched.accountName ? undefined : '只能使用英文、數字、底線'"
                required
                @blur="deferTouch('accountName')"
              />
              <v-text-field
                v-model="password"
                class="register-field"
                type="password"
                autocomplete="new-password"
                label="密碼"
                :error-messages="displayPwdErr"
                persistent-hint
                :hint="touched.password ? undefined : '僅英文與數字，且長度需大於 10 碼'"
                required
                @blur="deferTouch('password')"
              />
              <v-text-field
                v-model="confirmPassword"
                class="register-field"
                type="password"
                autocomplete="new-password"
                label="確認密碼"
                :error-messages="displayConfirmErr"
                persistent-hint
                :hint="touched.confirmPassword ? undefined : '請再次輸入相同密碼'"
                required
                @blur="deferTouch('confirmPassword')"
              />
              <v-btn color="primary" block type="submit" size="large">送出申辦</v-btn>
            </div>
          </form>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { lookupRegisterInvite, setRegisterSubmitInfo } from '~/utils/register';

type LookupState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'ready'; discordId: string };

type ApiRes = { message: string; data: unknown };

const ACCT_RE = /^[A-Za-z0-9_]+$/;
const PWD_RE = /^[A-Za-z0-9]+$/;
// 無錯時固定引用
const EMPTY: string[] = [];

const props = defineProps<{ invitationId: string }>();
const route = useRoute();

const lookupState = ref<LookupState>({ status: 'loading' });

const accountName = ref('');
const password = ref('');
const confirmPassword = ref('');
const touched = reactive({
  accountName: false,
  password: false,
  confirmPassword: false,
});

const deferTouch = (k: keyof typeof touched) =>
  queueMicrotask(() => {
    touched[k] = true;
  });

const errAccount = (v: string) =>
  !v.trim() ? '請輸入帳號名稱。' : !ACCT_RE.test(v) ? '帳號名稱只能使用英文、數字、底線。' : '';

const errPwd = (v: string) =>
  !v
    ? '請輸入密碼。'
    : !PWD_RE.test(v)
      ? '密碼只能使用英文與數字。'
      : v.length <= 10
        ? '密碼長度需要大於 10 碼。'
        : '';

const errConfirm = (pwd: string, c: string) =>
  !c ? '請再次輸入密碼。' : pwd !== c ? '密碼與確認密碼不一致。' : '';

const accountErr = computed(() => errAccount(accountName.value));
const pwdErr = computed(() => errPwd(password.value));
const confirmErr = computed(() => errConfirm(password.value, confirmPassword.value));

const displayAccountErr = computed(() =>
  touched.accountName && accountErr.value ? [accountErr.value] : EMPTY,
);
const displayPwdErr = computed(() => (touched.password && pwdErr.value ? [pwdErr.value] : EMPTY));
const displayConfirmErr = computed(() =>
  touched.confirmPassword && confirmErr.value ? [confirmErr.value] : EMPTY,
);

const resetCredentials = () => {
  accountName.value = '';
  password.value = '';
  confirmPassword.value = '';
  touched.accountName = false;
  touched.password = false;
  touched.confirmPassword = false;
};

const validateCredentials = ():
  | { ok: true; payload: { user_name: string; password: string } }
  | { ok: false; error: string } => {
  touched.accountName = true;
  touched.password = true;
  touched.confirmPassword = true;
  if (accountErr.value) return { ok: false, error: accountErr.value };
  if (pwdErr.value) return { ok: false, error: pwdErr.value };
  if (confirmErr.value) return { ok: false, error: confirmErr.value };
  return { ok: true, payload: { user_name: accountName.value.trim(), password: password.value } };
};

const runLookup = async () => {
  lookupState.value = { status: 'loading' };
  const id = props.invitationId.trim();
  if (!id) {
    lookupState.value = { status: 'not-found' };
    return;
  }
  const r = await lookupRegisterInvite(id);
  lookupState.value = r.found
    ? { status: 'ready', discordId: r.discordId }
    : { status: 'not-found' };
};

const syncLookup = async () => {
  await nextTick();
  resetCredentials();
  await runLookup();
};

watch(() => [props.invitationId, route.fullPath] as const, syncLookup, { immediate: true });

const goSubmitInfo = (variant: 'success' | 'error', message: string) => {
  setRegisterSubmitInfo({ variant, message });
  void navigateTo('/register/info');
};

const handleCredentialSubmit = async () => {
  if (lookupState.value.status !== 'ready') {
    goSubmitInfo('error', '邀請資料尚未完成驗證，請稍後再試。');
    return;
  }
  const v = validateCredentials();
  if (!v.ok) {
    goSubmitInfo('error', v.error);
    return;
  }
  try {
    const res = await fetch('/api/user/register', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        register_id: props.invitationId.trim(),
        user_name: v.payload.user_name,
        password: v.payload.password,
      }),
    });
    const json = (await res.json()) as ApiRes;
    const did = lookupState.value.status === 'ready' ? lookupState.value.discordId : '';

    if (!res.ok) {
      goSubmitInfo('error', json.message || `註冊失敗（${res.status}）`);
      return;
    }
    goSubmitInfo(
      'success',
      json.message ? `${json.message}（Discord ID：${did}）` : `註冊成功（Discord ID：${did}）`,
    );
  } catch {
    goSubmitInfo('error', '網路錯誤，請稍後再試。');
  }
};
</script>

<style scoped>
.register-field :deep(input::-webkit-strong-password-indicator),
.register-field :deep(input::-webkit-credentials-auto-fill-button) {
  display: none !important;
}

.register-field :deep(input::-ms-reveal),
.register-field :deep(input::-ms-clear) {
  display: none !important;
}
</style>

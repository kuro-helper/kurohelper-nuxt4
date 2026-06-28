<template>
  <div>
    <v-app-bar class="app-bar" elevation="0" fixed height="56" flat>
      <div class="app-bar__inner">
        <v-btn
          icon
          variant="text"
          aria-label="開啟選單"
          class="d-md-none app-bar__menu-btn"
          @click="drawer = true"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <NuxtLink to="/" class="app-bar__brand">
          <span class="app-bar__logo" aria-hidden="true">
            <img class="app-bar__logo-img" src="/favicon.ico" alt="" />
          </span>
          <span class="app-bar__title">KuroHelper</span>
        </NuxtLink>

        <nav class="app-bar__nav d-none d-md-flex" aria-label="主要導覽">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-bar__nav-link"
            :class="{ 'app-bar__nav-link--active': isNavActive(item.to) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <v-spacer />

        <div class="app-bar__actions">
          <v-tooltip :text="isDark ? '切換淺色模式' : '切換深色模式'" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                variant="text"
                size="small"
                class="app-bar__theme-btn"
                aria-label="切換淺色或深色主題"
                @click="toggleTheme"
              >
                <v-icon size="20">
                  {{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
                </v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-menu v-if="isLoggedIn && user" location="bottom end" offset="8">
            <template #activator="{ props: menuProps }">
              <button type="button" class="app-bar__user" aria-label="帳號選單" v-bind="menuProps">
                <v-avatar size="30" class="app-bar__user-avatar">
                  <v-img v-if="user.avatar" :src="user.avatar" :alt="user.nickName" cover />
                  <span v-else class="text-caption font-weight-bold">{{ userInitials }}</span>
                </v-avatar>
                <UserIdentity
                  :nick-name="user.nickName"
                  :user-name="user.userName"
                  size="sm"
                  class="app-bar__user-text d-none d-sm-flex"
                />
                <v-icon size="18" class="app-bar__user-chevron d-none d-sm-inline"
                  >mdi-chevron-down</v-icon
                >
              </button>
            </template>
            <v-list density="compact" min-width="180" rounded="lg" nav>
              <v-list-item
                :to="`/user/${user.id}`"
                prepend-icon="mdi-account-outline"
                title="個人資料"
              />
              <v-list-item
                prepend-icon="mdi-logout"
                title="登出"
                :disabled="logoutLoading"
                @click="submitLogout"
              />
            </v-list>
          </v-menu>

          <v-btn
            v-else
            color="primary"
            variant="flat"
            size="small"
            class="text-none app-bar__login-btn"
            @click="openLogin"
          >
            登入
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" width="300" class="app-drawer">
      <v-list density="comfortable" nav class="pa-3 pt-4">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          rounded="lg"
          :active="isNavActive(item.to)"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="20" />
          </template>
          <v-list-item-title>{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="loginOpen" max-width="420" opacity="0.58" scroll-strategy="block">
      <v-card rounded="xl" variant="flat" color="surface" elevation="12" class="login-dialog-card">
        <v-card-title>登入</v-card-title>
        <v-card-text>
          <v-alert v-if="loginError" type="error" variant="tonal" density="compact" class="mb-4">
            {{ loginError }}
          </v-alert>
          <v-text-field
            v-model="username"
            label="帳號"
            class="mt-2"
            autofocus
            hide-details
            :disabled="loginLoading"
            @keyup.enter="submitLogin"
          />
          <v-text-field
            v-model="password"
            type="password"
            label="密碼"
            class="mt-4"
            hide-details
            :disabled="loginLoading"
            @keyup.enter="submitLogin"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="loginLoading" @click="loginOpen = false">取消</v-btn>
          <v-btn color="primary" :loading="loginLoading" @click="submitLogin">登入</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isDark, toggleTheme } = useAppTheme();
const { user, isLoggedIn, login, logout, refresh } = useAuth();

const drawer = ref(false);
const loginOpen = ref(false);
const username = ref('');
const password = ref('');
const loginLoading = ref(false);
const loginError = ref('');
const logoutLoading = ref(false);

const navItems = [
  { to: '/', label: '首頁', icon: 'mdi-home-outline' },
  { to: '/game/1001', label: '遊戲詳情', icon: 'mdi-gamepad-variant-outline' },
  { to: '/user', label: '使用者', icon: 'mdi-account-outline' },
] as const;

const isNavActive = (to: string) => {
  if (to === '/') return route.path === '/';
  return route.path === to || route.path.startsWith(`${to}/`);
};

const userInitials = computed(() => {
  const name = user.value?.nickName?.trim() || '';
  if (!name) return '?';
  return name.slice(0, 1).toUpperCase();
});

const openLogin = async () => {
  loginError.value = '';
  await refresh();
  if (isLoggedIn.value) return;
  loginOpen.value = true;
};

const submitLogout = async () => {
  if (logoutLoading.value) return;
  logoutLoading.value = true;
  try {
    await logout();
    await navigateTo('/');
  } finally {
    logoutLoading.value = false;
  }
};

const submitLogin = async () => {
  loginError.value = '';
  const userName = username.value.trim();
  const pwd = password.value.trim();
  if (!userName || !pwd) {
    loginError.value = '請輸入帳號與密碼';
    return;
  }

  loginLoading.value = true;
  try {
    await login(userName, pwd);
    loginOpen.value = false;
    username.value = '';
    password.value = '';
  } catch (err) {
    loginError.value = authErrorMessage(err);
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
.app-bar {
  backdrop-filter: blur(14px) saturate(1.15);
  -webkit-backdrop-filter: blur(14px) saturate(1.15);
  background: rgba(var(--v-theme-surface), 0.78) !important;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.45);
}

.app-bar :deep(.v-toolbar__content) {
  padding: 0;
  height: 56px;
}

.app-bar__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 2200px;
  margin: 0 auto;
  padding: 0 12px;
  min-height: 56px;
}

@media (min-width: 600px) {
  .app-bar__inner {
    padding: 0 20px;
  }
}

.app-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 8px;
}

.app-bar__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 12px;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.72);
  background: rgba(var(--v-theme-surface-variant), 0.5);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-primary), 0.28),
    0 0 12px rgba(var(--v-theme-primary), 0.62),
    0 0 22px rgba(var(--v-theme-primary), 0.42),
    0 0 34px rgba(var(--v-theme-secondary), 0.48);
}

.app-bar__logo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.app-bar__title {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.app-bar__nav {
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}

.app-bar__nav-link {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.72);
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.app-bar__nav-link:hover {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.app-bar__nav-link--active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.14);
}

.app-bar__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-bar__theme-btn {
  opacity: 0.85;
}

.app-bar__user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-outline), 0.55);
  background: rgba(var(--v-theme-surface-variant), 0.55);
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.app-bar__user:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.08);
}

.app-bar__user-avatar {
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-theme-outline), 0.35);
}

.app-bar__user-text {
  min-width: 0;
  flex: 1 1 auto;
}

.app-bar__user-chevron {
  opacity: 0.5;
  flex-shrink: 0;
}

.app-bar__login-btn {
  min-width: 72px;
}
</style>

<style>
.login-dialog-card.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45) !important;
}

.v-theme--light .login-dialog-card.v-card {
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18) !important;
}
</style>

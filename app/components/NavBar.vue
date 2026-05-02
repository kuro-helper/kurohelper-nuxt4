<template>
  <div>
    <v-app-bar
      class="app-bar-glass"
      elevation="0"
      fixed
      height="64"
      color="transparent"
      :style="{ borderBottom: '1px solid rgb(var(--v-theme-outline))' }"
    >
      <v-toolbar density="compact" flat color="transparent" class="px-2">
        <v-btn
          icon
          variant="text"
          aria-label="menu"
          size="small"
          class="mr-2"
          @click="drawer = true"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <nuxt-link
          to="/"
          class="text-h6 text-decoration-none"
          style="color: inherit; font-weight: 700; letter-spacing: -0.01em"
        >
          KuroHelper
        </nuxt-link>
        <v-spacer />
        <v-tooltip :text="isDark ? '切換淺色模式' : '切換深色模式'" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="flat"
              rounded="circle"
              class="mr-2 theme-toggle-btn"
              width="36"
              height="36"
              aria-label="切換淺色或深色主題"
              @click="toggleTheme"
            >
              <v-icon size="small">
                {{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-btn variant="text" class="text-none mr-1" height="48" to="/game/1001">遊戲頁展示</v-btn>
        <v-btn variant="text" class="text-none" height="48" @click="loginOpen = true">登入</v-btn>
      </v-toolbar>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" width="350">
      <div class="pa-4 pb-2">
        <div class="text-h6">KuroHelper</div>
        <div class="text-body-2 text-medium-emphasis">快速導覽</div>
      </div>
      <v-divider />
      <v-list density="compact" nav class="pa-2">
        <v-list-item v-for="item in navItems" :key="item.to" :to="item.to" @click="drawer = false">
          {{ item.label }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="loginOpen" max-width="420" opacity="0.58" scroll-strategy="block">
      <v-card rounded="xl" variant="flat" color="surface" elevation="12" class="login-dialog-card">
        <v-card-title>登入</v-card-title>
        <v-card-text>
          <v-text-field v-model="username" label="帳號" class="mt-2" autofocus hide-details />
          <v-text-field v-model="password" type="password" label="密碼" class="mt-4" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="loginOpen = false">取消</v-btn>
          <v-btn color="primary" @click="closeLogin">登入</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useAppTheme();

const drawer = ref(false);
const loginOpen = ref(false);
const username = ref('');
const password = ref('');

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/game/1001', label: '遊戲詳情範例' },
  { to: '/user/1001', label: '使用者資料' },
] as const;

const closeLogin = () => {
  loginOpen.value = false;
};
</script>

<style scoped>
.app-bar-glass {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(var(--v-theme-surface), 0.58) !important;
}

.theme-toggle-btn.v-btn {
  border-radius: 50% !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14) !important;
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

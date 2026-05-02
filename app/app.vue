<template>
  <v-app>
    <v-app-bar color="surface" elevation="0" border>
      <v-app-bar-title class="text-h6 font-weight-bold letter-spacing-normal">
        KuroHelper
      </v-app-bar-title>
      <v-spacer />
      <v-chip class="mr-3" variant="tonal" color="primary" size="small">
        {{ isDarkMode ? '深色' : '淺色' }}
      </v-chip>
      <v-btn
        icon
        variant="text"
        :aria-label="isDarkMode ? '切換為淺色模式' : '切換為深色模式'"
        @click="toggleMode"
      >
        <v-icon>{{ isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="py-10" fluid style="max-width: 920px">
        <h1 class="text-h4 font-weight-bold mb-2">主題預覽</h1>
        <p class="text-medium-emphasis mb-8">
          深色／淺色由 Vuetify theme 控制；偏好會記在
          <code class="mx-1">localStorage[&quot;kurohelper-nuxt4-theme&quot;]</code>。
        </p>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-6">
              <v-card-title class="text-subtitle-1 px-0 pt-0">Primary / Secondary</v-card-title>
              <v-card-text class="px-0 pb-2">
                <div class="d-flex flex-wrap gap-2 mb-4">
                  <v-btn color="primary">Primary</v-btn>
                  <v-btn color="secondary">Secondary</v-btn>
                </div>
                <v-text-field label="Outlined 輸入" placeholder="圓角欄位" hide-details />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-6">
              <v-card-title class="text-subtitle-1 px-0 pt-0">Surface</v-card-title>
              <v-card-text class="text-body-2 text-medium-emphasis px-0 pb-0">
                <v-divider class="mb-4" />
                Card 使用 <code class="mx-1">surface</code>； 外層漸層與底色由下方式樣綁至
                <code class="mx-1">v-application</code>。
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <NuxtRouteAnnouncer />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';

const THEME_STORAGE_KEY = 'kurohelper-nuxt4-theme';

const theme = useTheme();

const isDarkMode = computed(() => theme.global.name.value === 'dark');

function applyStoredMode() {
  if (!import.meta.client) return;
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    theme.global.name.value = saved;
    return;
  }
  theme.global.name.value = 'dark';
}

function toggleMode() {
  const next = isDarkMode.value ? 'light' : 'dark';
  theme.global.name.value = next;
  if (import.meta.client) localStorage.setItem(THEME_STORAGE_KEY, next);
}

onMounted(() => applyStoredMode());
</script>

<style>
/* app 殼層背景漸層（原獨立 CSS 檔，收斂於此） */
.v-theme--dark .v-application,
.v-application.v-theme--dark {
  background:
    radial-gradient(circle at 20% 0%, rgba(139, 157, 255, 0.2), transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(95, 225, 194, 0.15), transparent 30%),
    linear-gradient(160deg, #0b1020 0%, #111833 100%) !important;
  background-attachment: fixed;
  min-height: 100vh;
}

.v-theme--light .v-application,
.v-application.v-theme--light {
  background:
    radial-gradient(circle at 15% 0%, rgba(78, 99, 216, 0.14), transparent 35%),
    radial-gradient(circle at 88% 10%, rgba(45, 159, 138, 0.12), transparent 28%),
    linear-gradient(160deg, #f8faff 0%, #e9efff 100%) !important;
  background-attachment: fixed;
  min-height: 100vh;
}

html {
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

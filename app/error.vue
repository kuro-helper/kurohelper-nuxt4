<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const code = computed(() => props.error?.statusCode ?? props.error?.status ?? 500);
const message = computed(() => {
  if (code.value === 404) return '找不到頁面。';
  return props.error?.statusMessage || props.error?.message || '請稍後再試。';
});
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center error-main">
      <v-card
        class="error-card pa-10 text-center"
        max-width="640"
        width="92%"
        rounded="xl"
        variant="flat"
        color="surface"
      >
        <v-card-title class="text-h3 font-weight-bold py-4">{{ code }}</v-card-title>
        <v-card-text class="text-h6 text-medium-emphasis">{{ message }}</v-card-text>
        <v-card-actions class="justify-center pt-0">
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-home"
            @click="clearError({ redirect: '/' })"
          >
            回首頁
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<style scoped>
.error-main {
  min-height: 100vh;
}

.error-card {
  border: none !important;
  box-shadow:
    inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.1),
    0 22px 55px rgba(0, 0, 0, 0.32) !important;
  isolation: isolate;
  transform: translateZ(0);
  backface-visibility: hidden;
}

:deep(.v-theme--light) .error-card {
  box-shadow:
    inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.09),
    0 18px 44px rgba(15, 23, 42, 0.12) !important;
}
</style>

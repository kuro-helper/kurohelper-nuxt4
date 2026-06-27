<template>
  <div class="user-identity" :class="`user-identity--${size}`">
    <div class="user-identity__nick">{{ nickName || '—' }}</div>
    <div v-if="userName" class="user-identity__handle">@{{ userName }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    nickName: string;
    userName?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md', userName: '' },
);
</script>

<style scoped>
.user-identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  line-height: 1.25;
}

.user-identity__nick {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.user-identity__handle {
  color: rgba(var(--v-theme-on-surface), 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.user-identity--sm .user-identity__nick {
  font-size: 0.8125rem;
}

.user-identity--sm .user-identity__handle {
  font-size: 0.6875rem;
}

.user-identity--md .user-identity__nick {
  font-size: 0.9375rem;
}

.user-identity--md .user-identity__handle {
  font-size: 0.75rem;
}

.user-identity--lg .user-identity__nick {
  font-size: 2.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.user-identity--lg .user-identity__handle {
  font-size: 1.25rem;
  margin-top: 2px;
}
</style>

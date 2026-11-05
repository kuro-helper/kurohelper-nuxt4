<template>
  <v-chip size="small" color="secondary" variant="tonal" label>
    平台：{{ category?.trim() || '未提供' }}
  </v-chip>
</template>

<script setup lang="ts">
defineProps<{
  category?: string | null;
}>();
</script>

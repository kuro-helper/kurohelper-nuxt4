<template>
  <v-select
    :model-value="modelValue"
    :items="platforms"
    label="篩選平台"
    variant="outlined"
    density="compact"
    hide-details
    clearable
    class="platform-filter"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import type { GameErogsItem } from '~/types/erogs-api';

const props = defineProps<{
  games: GameErogsItem[];
  modelValue: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const platforms = computed(() => {
  const categories = new Set(props.games.map((game) => game.category?.trim() || ''));
  return [...categories]
    .sort((a, b) => (a || '未提供').localeCompare(b || '未提供'))
    .map((category) => ({
      title: category || '未提供',
      value: category,
    }));
});
</script>

<style scoped>
.platform-filter {
  min-width: 150px;
  max-width: 180px;
}
</style>

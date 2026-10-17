<template>
  <v-sheet rounded="xl" border color="surface-variant" class="load-error-state pa-8 text-center">
    <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
    <p class="text-body-1 font-weight-medium" :class="detail ? 'mb-2' : 'mb-4'">{{ message }}</p>
    <p v-if="detail" class="text-body-2 text-medium-emphasis mb-4">{{ detail }}</p>
    <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="emit('retry')">
      重試
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  detail?: string;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<style scoped>
.load-error-state {
  border-style: dashed;
}
</style>

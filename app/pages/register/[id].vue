<template>
  <RegisterForm :key="$route.fullPath" :invitation-id="inviteId" />
</template>

<script setup lang="ts">
const route = useRoute();

const inviteId = computed(() =>
  typeof route.params.id === 'string'
    ? route.params.id
    : Array.isArray(route.params.id)
      ? (route.params.id[0] ?? '')
      : '',
);
</script>

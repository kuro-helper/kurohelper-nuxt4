<template>
  <v-chip :size="size" :color="chipColor" :class="chipClass" variant="tonal" label>
    <v-icon v-if="isOwner" start :size="iconSize">mdi-crown</v-icon>
    <v-icon v-else-if="isDeveloper" start :size="iconSize">mdi-wrench</v-icon>
    {{ userRoleLabel(role) }}
  </v-chip>
</template>

<script setup lang="ts">
import {
  isUserRoleDeveloper,
  isUserRoleOwner,
  userRoleColor,
  userRoleLabel,
} from '~/utils/userRole';

const props = withDefaults(
  defineProps<{
    role: number;
    size?: 'x-small' | 'small' | 'default';
  }>(),
  { size: 'small' },
);

const isOwner = computed(() => isUserRoleOwner(props.role));
const isDeveloper = computed(() => isUserRoleDeveloper(props.role));
const chipColor = computed(() =>
  isOwner.value || isDeveloper.value ? undefined : userRoleColor(props.role),
);
const chipClass = computed(() => ({
  'user-role-chip--owner': isOwner.value,
  'user-role-chip--developer': isDeveloper.value,
}));
const iconSize = computed(() => (props.size === 'x-small' ? 12 : 14));
</script>

<style scoped>
.user-role-chip--developer {
  color: rgb(var(--v-theme-info)) !important;
  background: rgba(var(--v-theme-info), 0.14) !important;
  border: 1px solid rgba(var(--v-theme-info), 0.55);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-info), 0.15),
    0 0 10px rgba(var(--v-theme-info), 0.5),
    0 0 18px rgba(var(--v-theme-info), 0.32);
}

.user-role-chip--owner {
  color: #ca8a04 !important;
  background: rgba(234, 179, 8, 0.16) !important;
  border: 1px solid rgba(234, 179, 8, 0.55);
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.2),
    0 0 10px rgba(234, 179, 8, 0.48),
    0 0 18px rgba(234, 179, 8, 0.32);
}

.v-theme--light .user-role-chip--owner {
  color: #a16207 !important;
  background: rgba(234, 179, 8, 0.22) !important;
}

.v-theme--light .user-role-chip--developer {
  color: rgb(var(--v-theme-info)) !important;
  background: rgba(var(--v-theme-info), 0.18) !important;
}
</style>

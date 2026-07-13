<template>
  <Transition name="scroll-top-fab">
    <v-btn
      v-show="visible"
      class="scroll-top-fab"
      color="primary"
      variant="flat"
      size="large"
      icon="mdi-chevron-up"
      aria-label="回到頂部"
      @click="scrollToTop"
    />
  </Transition>
</template>

<script setup lang="ts">
const visible = ref(false);
const SHOW_AFTER_PX = 480;

function onScroll() {
  visible.value = window.scrollY > SHOW_AFTER_PX;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.scroll-top-fab {
  position: fixed;
  right: 20px;
  bottom: 24px;
  z-index: 40;
  color: rgb(var(--v-theme-on-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.55) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
  border: 1px solid rgba(var(--v-theme-on-primary), 0.22);
}

.scroll-top-fab:hover {
  background: rgba(var(--v-theme-primary), 0.72) !important;
}

.scroll-top-fab-enter-active,
.scroll-top-fab-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.scroll-top-fab-enter-from,
.scroll-top-fab-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}
</style>

<template>
  <v-container max-width="md" class="py-10 py-md-16 px-4 text-center">
    <div class="d-flex flex-column align-center ga-6">
      <div class="home-hero__logo-wrap">
        <v-avatar size="72" rounded="lg" class="home-hero__logo">
          <img src="/favicon.ico" alt="" width="72" height="72" />
        </v-avatar>
      </div>

      <div class="d-flex flex-column ga-3">
        <h1 class="text-h3 text-md-h2 font-weight-bold tracking-tight">KuroHelper</h1>
        <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 28rem">
          Galgame 資料整理與個人遊玩紀錄助手。查詢遊戲資訊、管理願望清單與遊玩進度。
        </p>
      </div>

      <div class="d-flex flex-wrap justify-center ga-3">
        <v-btn color="primary" size="large" class="text-none" disabled>開始查詢</v-btn>
        <v-btn variant="outlined" size="large" class="text-none" to="/user">使用者列表</v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.home-hero__logo-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.home-hero__logo-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 34px;
  background: radial-gradient(
    circle,
    rgba(var(--v-theme-primary), 0.4) 0%,
    rgba(var(--v-theme-primary), 0.18) 34%,
    rgba(var(--v-theme-secondary), 0.14) 54%,
    transparent 74%
  );
  filter: blur(12px);
  z-index: 0;
  pointer-events: none;
  animation: home-hero-halo-breathe 3s ease-in-out infinite;
}

.home-hero__logo-wrap::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 28px;
  background: radial-gradient(
    circle,
    rgba(var(--v-theme-secondary), 0.26) 0%,
    rgba(var(--v-theme-primary), 0.14) 48%,
    transparent 70%
  );
  filter: blur(10px);
  z-index: 0;
  pointer-events: none;
  animation: home-hero-halo-breathe-soft 3s ease-in-out infinite;
  animation-delay: -1.5s;
}

.home-hero__logo {
  position: relative;
  z-index: 1;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.55);
  background: rgba(var(--v-theme-surface-variant), 0.5);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-primary), 0.16),
    0 0 28px rgba(var(--v-theme-primary), 0.28),
    0 0 56px rgba(var(--v-theme-primary), 0.18),
    0 0 72px rgba(var(--v-theme-secondary), 0.16);
}

@keyframes home-hero-halo-breathe {
  0%,
  100% {
    opacity: 0.22;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.38);
  }
}

@keyframes home-hero-halo-breathe-soft {
  0%,
  100% {
    opacity: 0.18;
    transform: scale(0.74);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.45);
  }
}
</style>

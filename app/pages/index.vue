<template>
  <v-container max-width="md" class="py-10 py-md-16 px-4 text-center">
    <div class="d-flex flex-column align-center ga-6">
      <v-avatar size="72" rounded="lg" class="home-hero__logo">
        <img src="/favicon.ico" alt="" width="72" height="72" />
      </v-avatar>

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
.home-hero__logo {
  border: 1.5px solid rgba(var(--v-theme-primary), 0.72);
  background: rgba(var(--v-theme-surface-variant), 0.5);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-primary), 0.28),
    0 0 12px rgba(var(--v-theme-primary), 0.45);
}
</style>

<template>
  <v-container class="py-6 py-md-10" max-width="md">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold tracking-tight">註冊帳號</h1>
      <p class="text-body-1 text-medium-emphasis mt-2">
        註冊 KuroHelper 網站帳號需透過 Discord 機器人取得私人連結，無法在此頁直接申請。
      </p>
    </div>

    <v-card rounded="xl" variant="outlined" class="mb-6">
      <v-card-text class="pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="primary" variant="tonal" size="40">
            <v-icon icon="mdi-robot-outline" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Discord 斜線指令</div>
            <div class="text-body-2 text-medium-emphasis">與 KuroHelper 機器人互動</div>
          </div>
        </div>

        <div class="slash-preview mb-5" aria-hidden="true">
          <span class="slash-preview__cmd">/註冊帳號</span>
          <span class="slash-preview__desc">註冊 KuroHelper 網站帳號</span>
        </div>

        <ol class="register-steps text-body-1">
          <li>前往已加入 KuroHelper 的 Discord 伺服器。</li>
          <li>在任意頻道輸入斜線指令 <strong>/註冊帳號</strong> 並送出。</li>
          <li>機器人會以<strong>僅本人可見</strong>的訊息回覆，內含你的私人註冊連結。</li>
          <li>點擊連結進入本網站，在<strong> 30 分鐘內</strong>完成帳號與密碼設定。</li>
        </ol>
      </v-card-text>
    </v-card>

    <p class="text-overline text-medium-emphasis mb-3">機器人回覆範例</p>

    <div class="d-flex flex-column ga-4 mb-6">
      <div class="embed-preview embed-preview--success">
        <div class="embed-preview__bar" />
        <div class="embed-preview__body">
          <div class="embed-preview__title">註冊連結已產生</div>
          <p class="embed-preview__desc">請使用以下私人連結完成註冊（30 分鐘內有效）</p>
          <div class="embed-preview__field">
            <div class="embed-preview__field-name">註冊連結</div>
            <div class="embed-preview__field-value">
              https://…/register/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            </div>
          </div>
        </div>
      </div>

      <div class="embed-preview embed-preview--done">
        <div class="embed-preview__bar" />
        <div class="embed-preview__body">
          <div class="embed-preview__title">你已經完成註冊</div>
          <p class="embed-preview__desc">目前帳號已綁定，不需要再次申辦</p>
        </div>
      </div>
    </div>

    <v-alert type="info" variant="tonal" class="mb-6">
      若你已持有註冊連結，請直接開啟該網址；連結過期或遺失時，請在 Discord 再次使用
      <strong>/註冊帳號</strong> 取得新連結。
    </v-alert>

    <div class="d-flex flex-wrap ga-3">
      <v-btn color="primary" size="large" to="/">回到首頁</v-btn>
      <v-btn v-if="isLoggedIn && user" variant="tonal" size="large" :to="`/user/${user.id}`">
        前往個人資料
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { user, isLoggedIn } = useAuth();

useHead({
  title: '註冊帳號',
});
</script>

<style scoped>
.slash-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.55);
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.slash-preview__cmd {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.slash-preview__desc {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.9375rem;
}

.register-steps {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.register-steps li::marker {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.embed-preview {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgba(var(--v-theme-surface-variant), 0.35);
}

.embed-preview__bar {
  width: 4px;
  flex-shrink: 0;
}

.embed-preview--success .embed-preview__bar {
  background: #7ba23f;
}

.embed-preview--done .embed-preview__bar {
  background: #b481bb;
}

.embed-preview__body {
  padding: 14px 16px;
  min-width: 0;
}

.embed-preview__title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 6px;
}

.embed-preview__desc {
  margin: 0 0 10px;
  font-size: 0.9375rem;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.embed-preview__field-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.62);
  margin-bottom: 4px;
}

.embed-preview__field-value {
  font-size: 0.875rem;
  word-break: break-all;
  color: rgb(var(--v-theme-primary));
}
</style>

export default defineNuxtPlugin(async (nuxtApp) => {
  const { refresh, user } = useAuth();

  if (import.meta.client) {
    // 在 hydration 完成後確認登入狀態，避免快取頁面包含使用者資料。
    nuxtApp.hook('app:mounted', async () => {
      if (!user.value) await refresh();
    });
  }
});

export default defineNuxtPlugin(async () => {
  const { refresh, user } = useAuth();
  await refresh();
  // SameSite=Strict：外站連結進來時 SSR 可能沒帶 cookie，client 再補查一次
  if (import.meta.client && !user.value) {
    await refresh();
  }
});

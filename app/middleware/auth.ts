/** 需登入才能進入；進頁時會重新打 /api/auth/me */
export default defineNuxtRouteMiddleware(async () => {
  const { user, refresh } = useAuth();
  await refresh();

  if (!user.value) {
    return navigateTo('/');
  }
});

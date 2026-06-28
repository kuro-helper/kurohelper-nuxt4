/** 使用者個人頁／編輯頁：路由 id 與「是否為本人可編輯」判斷 */
export const useUserProfileAccess = () => {
  const route = useRoute();
  const idParam = computed(() => {
    const id = route.params.id;
    return typeof id === 'string' ? id : (id?.[0] ?? '');
  });

  const { user: authUser, refresh: refreshAuth } = useAuth();

  const canEditProfile = computed(() => {
    const me = authUser.value;
    if (!me) return false;
    return String(me.id) === idParam.value;
  });

  watch(idParam, () => {
    refreshAuth();
  });

  const syncAuth = () => refreshAuth();

  return { idParam, authUser, refreshAuth, syncAuth, canEditProfile };
};

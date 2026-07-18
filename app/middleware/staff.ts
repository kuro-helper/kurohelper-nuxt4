import { isUserRoleStaff } from '~/utils/userRole';

/** 僅開發者／站主可進入；進頁時會重新打 /api/auth/me */
export default defineNuxtRouteMiddleware(async () => {
  const { user, refresh } = useAuth();
  await refresh();

  if (!user.value || !isUserRoleStaff(user.value.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: '權限不足',
      fatal: true,
    });
  }
});

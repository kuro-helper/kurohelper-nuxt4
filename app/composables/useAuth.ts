import type { AuthUser, LoginApiResponse, MeApiResponse } from '~/types/auth-api';
import type { FetchErrorLike } from '~/types/user-api';

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null);

  const isLoggedIn = computed(() => user.value !== null);

  const refresh = async () => {
    try {
      const res = await $fetch<MeApiResponse>('/api/auth/me');
      const u = res.data?.user;
      if (u && !u.userName) {
        user.value = null;
        return;
      }
      user.value = u ?? null;
    } catch {
      user.value = null;
    }
  };

  const login = async (userName: string, password: string) => {
    const res = await $fetch<LoginApiResponse>('/api/auth/login', {
      method: 'POST',
      body: { userName, password },
    });
    const u = res.data?.user;
    if (!u?.userName) {
      throw new Error('登入回應缺少帳號資料');
    }
    user.value = u;
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      user.value = null;
    }
  };

  return { user, isLoggedIn, refresh, login, logout };
};

export const authErrorMessage = (err: unknown, fallback = '登入失敗，請稍後再試') => {
  const e = err as FetchErrorLike;
  if (typeof e.data?.message === 'string' && e.data.message) return e.data.message;
  if (typeof e.message === 'string' && e.message) return e.message;
  if (typeof e.statusMessage === 'string' && e.statusMessage) return e.statusMessage;
  return fallback;
};

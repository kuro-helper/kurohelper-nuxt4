import type { AuthUser, LoginApiResponse, MeApiResponse } from '~/types/auth-api';
import type { FetchErrorLike } from '~/types/user-api';

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null);

  const isLoggedIn = computed(() => user.value !== null);

  const refresh = async () => {
    try {
      const res = await $fetch<MeApiResponse>('/api/auth/me');
      user.value = res.data?.user ?? null;
    } catch {
      user.value = null;
    }
  };

  const login = async (userName: string, password: string) => {
    const res = await $fetch<LoginApiResponse>('/api/auth/login', {
      method: 'POST',
      body: { userName, password },
    });
    user.value = res.data?.user ?? null;
  };

  return { user, isLoggedIn, refresh, login };
};

export const authErrorMessage = (err: unknown, fallback = '登入失敗，請稍後再試') => {
  const e = err as FetchErrorLike;
  if (typeof e.data?.message === 'string' && e.data.message) return e.data.message;
  if (typeof e.statusMessage === 'string' && e.statusMessage) return e.statusMessage;
  return fallback;
};

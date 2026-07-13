import { computed } from 'vue';
import { useTheme } from 'vuetify';

export type AppThemeName = 'dark' | 'light';

export const THEME_COOKIE = 'kurohelper-theme';

export function normalizeAppTheme(value: unknown): AppThemeName {
  return value === 'light' ? 'light' : 'dark';
}

export function useThemeCookie() {
  return useCookie<AppThemeName>(THEME_COOKIE, {
    default: () => 'dark',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  });
}

export const useAppTheme = () => {
  const theme = useTheme();
  const themeCookie = useThemeCookie();
  const isDark = computed(() => theme.global.current.value.dark);

  const setTheme = (name: AppThemeName) => {
    const next = normalizeAppTheme(name);
    theme.change(next);
    themeCookie.value = next;
  };

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark');
  };

  return { isDark, toggleTheme, setTheme };
};

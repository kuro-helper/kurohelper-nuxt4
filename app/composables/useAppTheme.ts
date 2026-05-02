import { computed } from 'vue';
import { useTheme } from 'vuetify';

export const useAppTheme = () => {
  const theme = useTheme();
  const isDark = computed(() => theme.global.current.value.dark);

  const toggleTheme = () => {
    theme.change(isDark.value ? 'light' : 'dark');
  };

  return { isDark, toggleTheme };
};

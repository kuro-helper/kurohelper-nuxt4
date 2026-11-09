export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useThemeCookie();
  // Keep the server-rendered theme until hydration is complete.
  const initialTheme = useState('app-theme', () => normalizeAppTheme(themeCookie.value));

  nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
    if (vuetifyOptions.theme === false) return;
    vuetifyOptions.theme ??= {};
    vuetifyOptions.theme.defaultTheme = initialTheme.value;
  });

  if (import.meta.client) {
    onNuxtReady(() => {
      const name = normalizeAppTheme(themeCookie.value);
      const theme = nuxtApp.$vuetify.theme;
      if (theme.global.name.value !== name) {
        void theme.change(name);
      }
    });
  }
});

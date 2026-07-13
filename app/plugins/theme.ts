export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useThemeCookie();

  nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
    const name = normalizeAppTheme(themeCookie.value);
    if (vuetifyOptions.theme === false) return;
    vuetifyOptions.theme ??= {};
    vuetifyOptions.theme.defaultTheme = name;
  });
});

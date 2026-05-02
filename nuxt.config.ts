/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '@fontsource/geist-sans/400.css',
    '@fontsource/geist-sans/600.css',
    '@fontsource/geist-sans/700.css',
    '~/assets/css/global.css',
  ],
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL ?? '',
    apiToken: process.env.API_TOKEN ?? '',
    public: {},
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: ['vuetify-nuxt-module'],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            dark: false,
            colors: {
              background: '#dfe5ef',
              surface: '#f6f8fc',
              'surface-variant': '#e9eef7',
              primary: '#1d63d8',
              secondary: '#0f766e',
              success: '#047857',
              warning: '#b45309',
              error: '#b91c1c',
              info: '#1d4ed8',
              'on-background': '#0c1222',
              'on-surface': '#0c1222',
              'on-surface-variant': '#3d4a63',
              'on-primary': '#ffffff',
              'on-secondary': '#ffffff',
              'on-success': '#ffffff',
              'on-warning': '#0c1222',
              'on-error': '#ffffff',
              'on-info': '#ffffff',
              outline: '#8b96ad',
              'inverse-on-surface': '#f8fafc',
              'inverse-surface': '#1e293b',
            },
          },
          dark: {
            dark: true,
            colors: {
              primary: '#8B5CF6',
              secondary: '#38BDF8',
              success: '#22C55E',
              error: '#F87171',
              background: '#090B14',
              surface: '#12172A',
              'surface-variant': '#161d32',
              'on-background': '#e6eaf5',
              'on-surface': '#e6eaf5',
              'on-surface-variant': '#94a3c8',
              'on-primary': '#0b0814',
              'on-secondary': '#061016',
              'on-success': '#061016',
              'on-warning': '#12172a',
              'on-error': '#12172a',
              'on-info': '#0b0814',
              outline: '#3d4d70',
              warning: '#eab308',
              info: '#60a5fa',
            },
          },
        },
      },
      defaults: {
        global: {
          ripple: false,
        },
        VBtn: {
          rounded: 'pill',
          style: [{ textTransform: 'none', fontWeight: 600, minHeight: '40px' }],
        },
        VCard: {
          rounded: 'lg',
          elevation: 0,
          variant: 'outlined',
          class: 'mui-card',
        },
        VChip: {
          rounded: 'pill',
        },
        VTextField: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable',
        },
        VSelect: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable',
        },
        VTextarea: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable',
        },
      },
    },
  },
});

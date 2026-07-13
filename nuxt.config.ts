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
    // runtimeConfig.apiBaseUrl ← NUXT_API_BASE_URL
    // runtimeConfig.apiToken   ← NUXT_API_TOKEN
    // runtimeConfig.gameErogsAutocompleteFile ← NUXT_GAME_EROGS_AUTOCOMPLETE_FILE
    apiBaseUrl: '',
    apiToken: '',
    gameErogsAutocompleteFile: '',
    public: {
      siteUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      twitterCard: '',
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: ['@nuxt/eslint', 'vuetify-nuxt-module'],
  eslint: {
    checker: false,
  },
  vuetify: {
    vuetifyOptions: {
      labComponents: ['VDateInput'],
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            dark: false,
            colors: {
              background: '#e6ebf4',
              surface: '#f8fafc',
              'surface-variant': '#eef2f8',
              primary: '#1d4ed8',
              secondary: '#0284c7',
              success: '#059669',
              warning: '#b45309',
              error: '#b91c1c',
              info: '#2563eb',
              'on-background': '#0c1222',
              'on-surface': '#0c1222',
              'on-surface-variant': '#3d4a63',
              'on-primary': '#ffffff',
              'on-secondary': '#ffffff',
              'on-success': '#ffffff',
              'on-warning': '#0c1222',
              'on-error': '#ffffff',
              'on-info': '#ffffff',
              outline: '#a8b4c8',
              'inverse-surface': '#1e293b',
              'inverse-on-surface': '#f8fafc',
            },
          },
          dark: {
            dark: true,
            colors: {
              background: '#090b14',
              surface: '#12172a',
              'surface-variant': '#161d32',
              primary: '#8b5cf6',
              secondary: '#38bdf8',
              success: '#22c55e',
              warning: '#eab308',
              error: '#f87171',
              info: '#60a5fa',
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
              'inverse-surface': '#e6eaf5',
              'inverse-on-surface': '#12172a',
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
        VDateInput: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable',
          prependInnerIcon: 'mdi-calendar',
          inputFormat: 'yyyy/MM/dd',
        },
        VAutocomplete: {
          variant: 'outlined',
          rounded: 'lg',
          density: 'comfortable',
        },
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },
});

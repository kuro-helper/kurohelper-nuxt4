// 與 kurohelper-nuxt3 相同：manual createVuetify；主題設定集中在此檔。
import { defineNuxtPlugin } from 'nuxt/app'
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const appLightTheme = {
	dark: false,
	colors: {
		background: '#f3f6ff',
		surface: '#ffffff',
		primary: '#4e63d8',
		secondary: '#2d9f8a',
		success: '#2d7a54',
		warning: '#b8860b',
		error: '#c62828',
		info: '#394aa7',
		'on-background': '#1b2238',
		'on-surface': '#1b2238',
		'on-primary': '#ffffff',
		'on-secondary': '#ffffff',
		'on-success': '#ffffff',
		'on-warning': '#1b2238',
		'on-error': '#ffffff',
		'on-info': '#ffffff',
		outline: 'rgba(17, 24, 39, 0.12)',
		'surface-variant': '#e3e8ff',
	},
}

const appDarkTheme = {
	dark: true,
	colors: {
		background: '#0b1020',
		surface: '#111833',
		primary: '#8b9dff',
		secondary: '#5fe1c2',
		success: '#5fe1c2',
		warning: '#e6c84a',
		error: '#f28b82',
		info: '#8b9dff',
		'on-background': '#e6e9f5',
		'on-surface': '#e6e9f5',
		'on-primary': '#0b1020',
		'on-secondary': '#0b1020',
		'on-success': '#0b1020',
		'on-warning': '#111833',
		'on-error': '#111833',
		'on-info': '#0b1020',
		outline: 'rgba(255, 255, 255, 0.1)',
		'surface-variant': '#1a2344',
	},
}

export default defineNuxtPlugin((nuxtApp) => {
	const vuetify = createVuetify({
		components,
		directives,
		theme: {
			defaultTheme: 'dark',
			themes: {
				light: appLightTheme,
				dark: appDarkTheme,
			},
		},
		defaults: {
			global: {
				ripple: false,
			},
			VBtn: {
				rounded: 'lg',
				style: [{ textTransform: 'none', fontWeight: 600 }],
			},
			VCard: {
				rounded: 'lg',
				elevation: 0,
				variant: 'outlined',
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
	})
	nuxtApp.vueApp.use(vuetify)
})

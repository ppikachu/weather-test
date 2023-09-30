// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: [
		"@nuxt/ui",
		"@nuxt/image",
		"@vueuse/nuxt",
		"@vite-pwa/nuxt",
		"@nuxtjs/device",
	],
	runtimeConfig: {
		public: {
			RapidAPIKey: process.env.RapidAPIKey,
			RapidAPIHost: process.env.RapidAPIHost,
		},
	},
	appConfig: {
		// you don't need to include this: only for testing purposes
		buildDate: new Date().toISOString(),
	},
	pwa: {
		registerType: "autoUpdate",
		manifest: {
			name: "Weather App",
			short_name: "WAP",
			description: "Animated weather effects",
			id: "/",
			start_url: "/",
			display: "minimal-ui",
			theme_color: "#432",
			background_color: "#000",
			icons: [
				{
					src: "/pwa-64x64.png",
					sizes: "64x64",
					type: "image/png",
				},
				{
					src: "/pwa-192x192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "/pwa-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "/maskable-icon-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "maskable",
				},
			],
		},
		workbox: {
			navigateFallback: '/',
			globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
		},
		client: {
			installPrompt: true,
			// you don't need to include this: only for testing purposes
			// if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
			// periodicSyncForUpdates: 20,
		},
		devOptions: {
			enabled: true,
			// suppressWarnings: true,
			// type: 'module',
		},
	},
	ui: {
		icons: ["mdi"],
	},
});

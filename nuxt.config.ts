// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// devtools: { enabled: true },
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
	pwa: {
		/* your pwa options */
	},
	ui: {
		icons: ["mdi"],
	},
});

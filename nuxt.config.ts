// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxt/ui", "@nuxt/image"],
	runtimeConfig: {
		public: {
			RapidAPIKey: process.env.RapidAPIKey,
			RapidAPIHost: process.env.RapidAPIHost,
		},
	},
	image: {
		format: ["webp", "png"],
		provider: "ipx",
		ipx: {
			// @ts-ignore
			modifiers: {
				quality: "80",
				format: ["webp", "png"],
			},
		},
	},
	ui: {
		icons: ["mdi"],
	},
})

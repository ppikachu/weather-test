<script setup>
useSeoMeta({
	title: 'Weather App',
	description: 'Animated weather effects',
	ogTitle: 'Weather App',
	ogDescription: 'Animated weather effects',
	ogImage: '/images/a-forest.jpg',
	ogUrl: 'https://weather-test-livid.vercel.app',
	ogType: 'website',
	twitterSite: '@ppika',
	twitterTitle: 'Weather App',
	twitterDescription: 'Animated weather effects',
	twitterImage: '/pwa-512x512.png',
	twitterCard: 'app'
})

/* 
{ name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
{ property: "og:title", content: "Weather app" },
{ property: "og:description", content: "Animated weather effects" },
{ property: "og:type", content: "website" },
{ property: "og:image", content: "/images/a-forest.jpg" },
{ property: 'og:image:width', content: '3800' },
{ property: 'og:image:height', content: '1900' },
{ property: "og:site_name", content: "Weather app" },
{ property: "twitter:site", content: "@ppika" },
{ property: "twitter:card", content: "summary_large_image" },
*/

useHead({
	htmlAttrs: {
		lang: 'en'
	},
	link: [
		{
			rel: 'icon',
			type: 'image/png',
			href: '/pwa-64x64.png'
		}
	]
})

const { coords, error, resume, pause } = useGeolocation()
const location = useBrowserLocation()
</script>

<template>
	<div>
		<VitePwaManifest />
		<NuxtLoadingIndicator />

		<Hero
			:latitude="coords.latitude !== Infinity ? coords.latitude : -34.58"
			:longitude="coords.longitude !== Infinity ? coords.longitude : -58.4"
		/>

			<UAlert v-if="location.hostname === 'localhost'"
				title="debug"
				icon="i-mdi-alert-circle-outline"
				color="yellow"
				variant="soft"
				:ui="{ padding: 'p-2', wrapper: 'absolute w-1/3 top-2 left-2' }"
			>
				<template #title>Debug</template>
				<template #description>
					<div class="flex flex-col text-xs">
						<span>Location: {{ coords.latitude }}, {{ coords.longitude }}</span>
					</div>
				</template>
			</UAlert>

	</div>
</template>
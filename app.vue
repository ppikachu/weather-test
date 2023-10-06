<script setup lang="ts">
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
const fps = useFps()
const focused = useWindowFocus()
</script>

<template>
	<div>
		<VitePwaManifest />
		<NuxtLoadingIndicator />
		
		<section class="absolute top-2 left-2 z-20">
			<UBadge v-if="location.hostname === 'localhost'"
				title="debug"
				variant="soft"
			>
				<div class="text-xs flex flex-col">
					<span>FPS: {{ fps }}</span>
					<span>useGeolocation: {{ coords.latitude }}, {{ coords.longitude }}</span>
				</div>
			</UBadge>
		</section>

		<Hero
			:latitude="coords.latitude !== Infinity ? coords.latitude : -34.58"
			:longitude="coords.longitude !== Infinity ? coords.longitude : -58.4"
		/>

	</div>
</template>
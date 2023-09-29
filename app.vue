<script setup>
useSeoMeta({
	title: 'Weather App',
	description: 'Animated weather effects',
	ogTitle: 'Weather App',
	ogDescription: 'Animated weather effects',
	ogImage: '/images/a-forest.jpg',
	ogUrl: 'https://weather-test-livid.vercel.app',
	twitterTitle: 'Weather App',
	twitterDescription: 'Animated weather effects',
	twitterImage: '/pwa-512x512.png',
	twitterCard: 'summary'
})

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
</script>

<template>
	<!-- <Hero /> -->
	<div>
		<VitePwaManifest />
		<NuxtLoadingIndicator />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>
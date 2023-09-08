<script setup>
useSeoMeta({
	title: 'weather glsl',
	description: 'animated weather',
	ogTitle: 'weather glsl',
	ogDescription: 'animated weather',
	ogImage: 'images',
	ogUrl: 'https://weather-test-livid.vercel.app',
	twitterTitle: 'weather glsl',
	twitterDescription: 'animated weather',
	twitterImage: '/images/ordinaryheart_i05.jpg',
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
			href: '/favicon.png'
		}
	]
})
</script>

<template>
	<Hero />
</template>

<script setup>
// import GlslCanvas from 'glslCanvas'
import { resolveLygia } from 'resolve-lygia'
import rainFragment from '~/assets/shaders/rain.frag?raw'
import norainFragment from '~/assets/shaders/sdf1.frag?raw'
// test weather
import fakeData from '~/assets/sample-data.json'

//TODO: use package or minified js
useHead({
	script: [{
		type: 'text/javascript',
		src: 'https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js',
		body: true
	}],
})

/* Define props */
const props = defineProps({
	texture: { type: String, default: '/images/ordinaryheart_i05.jpg' },
	colorA: { type: Array, default: [1, 0, 0] },
	colorB: { type: Array, default: [0, 0, 1] },
	test: { type: Number, default: 1 },
})

const config = useRuntimeConfig()

const url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=-34.58%2C-58.39'
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': config.public.RapidAPIKey,
		'X-RapidAPI-Host': config.public.RapidAPIHost
	}
}
const { data } = await useFetch(url, options)

const Shader = ref()
const heroCanvas = ref()
const sandbox = ref()
const heroLoading = ref(true)

// TODO: size?, format?, something or fix this!
const $img = useImage()
const photo = $img(props.texture, { format: 'webp', fit: 'cover', width: 1000, height: 1000 })

/*
// Listeners
	const { width, height } = useWindowSize()

watch([y,width,height], () => {
	// set chroma by scroll
	const pctCanvasScroll = (y.value/heroCanvas.value.clientHeight)*2
	sandbox.value.setUniform("u_scroll", pctCanvasScroll > 1 ?  1 : pctCanvasScroll)
	// set canvas resolution
	sandbox.value.setUniform("u_resolution", [heroCanvas.value.clientHeight, heroCanvas.value.clientWidth])
	}
)
*/

onMounted(() => {
	// resolve-lygia package:
	data.value.current.precip_mm > 0 ? Shader.value = resolveLygia(rainFragment) : Shader.value = resolveLygia(norainFragment)
	// fakeData.current.precip_mm > 0 ? Shader.value = resolveLygia(rainFragment) : Shader.value = resolveLygia(norainFragment)
	// setup
	sandbox.value = new GlslCanvas(heroCanvas.value)
	heroCanvas.value.style.width = "100%"
	heroCanvas.value.style.height = "100%"
	// Load resolved shader:
	sandbox.value.load(Shader.value)
	// set canvas resolution
	sandbox.value.setUniform("u_resolution", [heroCanvas.value.clientHeight, heroCanvas.value.clientWidth])
	// Load a new texture and assign it to "uniform sampler2D u_texture":
	sandbox.value.setUniform("u_tex0", photo)
	sandbox.value.setUniform("textureAspect", 1.0)
	sandbox.value.setUniform("u_test", props.test)
	sandbox.value.setUniform("u_colorA", props.colorA[0], props.colorA[1], props.colorA[2])
	sandbox.value.setUniform("u_colorB", props.colorB[0], props.colorB[1], props.colorB[2])
	heroLoading.value = false;
})
</script>

<template>
	<div id="divPortada" data-anchor="portada" class="relative">
		<canvas ref="heroCanvas" class="sticky top-0 max-h-screen w-full" />
		<div v-show="heroLoading"
			class="absolute top-0 w-full h-screen flex items-center justify-center bg-black text-gray-500 z-40">
			<Icon name="mdi:creation" class="text-4xl animate-pulse" />
		</div>
	</div>
	<div class="absolute flex items-end justify-center inset-8">
		<UCard class="max-w-max aspect-square bg-opacity-20">
			<template #header>
				<h1 class="text-center text-xl text-indigo-300">{{ data.current.condition.text }}</h1>
			</template>
			<img :src="data.current.condition.icon" class="w-16 mx-auto mb-6" />
			<div class="flex justify-between space-x-2">
				<UBadge color="indigo" size="lg" variant="soft">
					<UIcon name="i-mdi-thermometer" />{{ data.current.temp_c }} °C
				</UBadge>
				<UBadge color="indigo" size="lg" variant="soft">
					<UIcon name="i-mdi-weather-pouring" />&nbsp;{{ data.current.precip_mm }} mm
				</UBadge>
			</div>
		</UCard>
	</div>
</template>

<style scoped>#divPortada {
	height: 100vh;
}</style>
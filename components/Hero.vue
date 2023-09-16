<script setup lang="ts">
// @ts-ignore
import { resolveLygia } from 'resolve-lygia'
import rainFragment from '~/assets/shaders/rain.frag?raw'
// import GlslCanvas from 'glslCanvas'

//TODO: use package or minified js
useHead({
	script: [{
		type: 'text/javascript',
		src: 'https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js',
	}]
})

/* Define props */
interface Props {
	texture: string
	test: boolean
}

const props: Props = defineProps({
	texture: { type: String, default: '/images/TimeToForest_3.png' },
	test: { type: Boolean, default: false },
})

// test weather
import fakeData from '~/assets/sample-data-rain.json'

// api weather
const config = useRuntimeConfig()
const url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=-34.58,-58.39'
const options: object = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': config.public.RapidAPIKey,
		'X-RapidAPI-Host': config.public.RapidAPIHost
	}
}
const { data: apiData } = await useFetch(url, options)
const finalApiData = apiData.value
// test weather check
const finalData: WeatherData | any = props.test ? fakeData : finalApiData

// modal
const isOpen = ref(false)

// sandbox
const Shader = ref()
const heroCanvas = ref()
const sandbox = ref()
const heroLoading = ref(true)

// TODO: size?, format?, something or fix this!
const $img = useImage()
const photo = $img(props.texture, { format: 'webp' })

// Listeners
const { width: canvaswidth, height: canvasheight } = useWindowSize()

watch([canvaswidth, canvasheight], () => {
	// set canvas resolution
	sandbox.value.setUniform("u_resolution", [canvaswidth, canvasheight])
}
)

watchImmediate(finalData, (obj) => {
	if (sandbox.value) {
		// sandbox.value.setUniform("thunder", finalData.value.thunder)
		sandbox.value.setUniform("temp_c", finalData.current.temp_c)
		sandbox.value.setUniform("precip_mm", finalData.current.precip_mm)
	}
})

function doSomethingOnLoad() {
	const iwidth: any = document.getElementById("imgPlaceholder") ? document.getElementById("imgPlaceholder")?.clientWidth : 10
	const iheight: any = document.getElementById("imgPlaceholder")? document.getElementById("imgPlaceholder")?.clientHeight : 10
	// resolve-lygia package:
	Shader.value = resolveLygia(rainFragment)
	// setup
	// @ts-ignore //this is a hack. glslCanvas is loaded in the head html
	sandbox.value = new GlslCanvas(heroCanvas.value)
	heroCanvas.value.style.width = "100%"
	heroCanvas.value.style.height = "100%"
	// Load resolved shader:
	sandbox.value.load(Shader.value)
	// set canvas resolution
	sandbox.value.setUniform("u_resolution", [heroCanvas.value.clientHeight, heroCanvas.value.clientWidth])
	// Load a new texture and assign it to "uniform sampler2D u_texture":
	sandbox.value.setUniform("u_tex0", photo)
	sandbox.value.setUniform("u_tex0Resolution", iwidth / iheight)
	// weather
	sandbox.value.setUniform("u_test", props.test)
	sandbox.value.setUniform("thunder", thunderLevel())
	sandbox.value.setUniform("temp_c", finalData.current.temp_c)
	sandbox.value.setUniform("precip_mm", finalData.current.precip_mm)

	heroLoading.value = false;
}

function thunderLevel() {
	switch (finalData.current.condition.code) {
		// Patchy light rain with thunder
		case 1273: return 0.25;
		// Moderate or heavy rain with thunder
		case 1276: return 0.5;
		// Torrential rain shower
		case 1246: return 1.0;
		// code to be executed if the condition.code doesn't match any cases
		default: return 0;
	}
}

</script>

<template>
	<div id="divPortada" data-anchor="portada" class="relative h-screen">
		<div ref="tweakpane" class="absolute"></div>
		<UButton icon="i-mdi-cog" variant="link" @click="isOpen = true" class="absolute m-4 z-10" />
		<UModal v-model="isOpen">
			<div class="p-4">
				<span class="block">Temp:</span>
				<URange v-model="finalData.current.temp_c" size="sm" :min="0" :max="40" />
				<span class="mt-4 block">Precipitation:</span>
				<URange v-model="finalData.current.precip_mm" size="sm" :min="0" :max="20" />
				<span class="mt-4 text-xs block text-center text-gray-500">click outside to dismiss or <UKbd value="Esc" /></span>
			</div>
		</UModal>
		<NuxtImg :src="props.texture" id="imgPlaceholder" @load="doSomethingOnLoad" class="absolute" />
		<canvas ref="heroCanvas" class="sticky top-0 max-h-screen w-full" />
		<div v-show="heroLoading"
			class="absolute top-0 w-full h-screen flex items-center justify-center bg-black text-gray-500 z-40">
			<UIcon name="i-mdi-creation" class="text-4xl animate-pulse" />
		</div>
	</div>
	<div class="absolute flex items-end justify-center inset-8 text-xs">
		<div class="bg-gradient-to-t from-gray-950 to-gray-900 flex items-center space-x-4 pr-4 rounded-full">

			<img :src="finalData.current.condition.icon" class="w-8 -mr-4" />
			
			<h1 class="">{{ finalData.current.condition.text }}</h1>

			<span class="flex items-center">
				<UIcon name="i-mdi-thermometer" />{{ finalData.current.temp_c }} °C
			</span>

			<span class="flex items-center">
				<UIcon name="i-mdi-weather-pouring" />&nbsp;{{ finalData.current.precip_mm }} mm
			</span>

		</div>
	</div>
</template>
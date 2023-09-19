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

// api weather
const config = useRuntimeConfig()
const url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=-34.58,-58.39'
const options: object = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': config.public.RapidAPIKey,
		'X-RapidAPI-Host': config.public.RapidAPIHost
	},
	pick: ['current']
}
const { data: apidata } = await useFetch<WeatherData>(url, options)
// test weather check
import fakeData from '~/assets/sample-data-rain.json'
if (props.test) {
	apidata.value = fakeData as WeatherData
}

// modal
const isOpen = ref(false)

// sandbox
const Shader = ref()
const heroCanvas = ref()
const sandbox = ref()
const heroLoading = ref(true)
const thunderLevels = [
	{code: 1000, thlevel: 0.00, condition: "Clear"},
	{code: 1003, thlevel: 0.00, condition: "Partly cloudy"},
	{code: 1006, thlevel: 0.00, condition: "Cloudy"},
	{code: 1009, thlevel: 0.00, condition: "Overcast"},
	{code: 1030, thlevel: 0.00, condition: "Mist"},
	{code: 1063, thlevel: 0.00, condition: "Patchy rain possible"},
	{code: 1066, thlevel: 0.00, condition: "Patchy snow possible"},
	{code: 1069, thlevel: 0.00, condition: "Patchy sleet possible"},
	{code: 1072, thlevel: 0.00, condition: "Patchy freezing drizzle possible"},
	{code: 1087, thlevel: 0.00, condition: "Thundery outbreaks possible"},
	{code: 1114, thlevel: 0.00, condition: "Blowing snow"},
	{code: 1117, thlevel: 0.00, condition: "Blizzard"},
	{code: 1135, thlevel: 0.00, condition: "Fog"},
	{code: 1147, thlevel: 0.00, condition: "Freezing fog"},
	{code: 1150, thlevel: 0.00, condition: "Patchy light drizzle"},
	{code: 1153, thlevel: 0.00, condition: "Light drizzle"},
	{code: 1168, thlevel: 0.00, condition: "Freezing drizzle"},
	{code: 1171, thlevel: 0.00, condition: "Heavy freezing drizzle"},
	{code: 1180, thlevel: 0.00, condition: "Patchy light rain"},
	{code: 1183, thlevel: 0.00, condition: "Light rain"},
	{code: 1186, thlevel: 0.00, condition: "Moderate rain at times"},
	{code: 1189, thlevel: 0.00, condition: "Moderate rain"},
	{code: 1192, thlevel: 0.00, condition: "Heavy rain at times"},
	{code: 1195, thlevel: 0.00, condition: "Heavy rain"},
	{code: 1198, thlevel: 0.00, condition: "Light freezing rain"},
	{code: 1201, thlevel: 0.00, condition: "Moderate or heavy freezing rain"},
	{code: 1204, thlevel: 0.00, condition: "Light sleet"},
	{code: 1207, thlevel: 0.00, condition: "Moderate or heavy sleet"},
	{code: 1210, thlevel: 0.00, condition: "Patchy light snow"},
	{code: 1213, thlevel: 0.00, condition: "Light snow"},
	{code: 1216, thlevel: 0.00, condition: "Patchy moderate snow"},
	{code: 1219, thlevel: 0.00, condition: "Moderate snow"},
	{code: 1222, thlevel: 0.00, condition: "Patchy heavy snow"},
	{code: 1225, thlevel: 0.00, condition: "Heavy snow"},
	{code: 1237, thlevel: 0.00, condition: "Ice pellets"},
	{code: 1240, thlevel: 0.00, condition: "Light rain shower"},
	{code: 1243, thlevel: 0.00, condition: "Moderate or heavy rain shower"},
	{code: 1246, thlevel: 1.00, condition: "Torrential rain shower"},
	{code: 1249, thlevel: 0.00, condition: "Light sleet showers"},
	{code: 1252, thlevel: 0.00, condition: "Moderate or heavy sleet showers"},
	{code: 1255, thlevel: 0.00, condition: "Light snow showers"},
	{code: 1258, thlevel: 0.00, condition: "Moderate or heavy snow showers"},
	{code: 1261, thlevel: 0.00, condition: "Light showers of ice pellets"},
	{code: 1264, thlevel: 0.00, condition: "Moderate or heavy showers of ice pellets"},
	{code: 1273, thlevel: 0.25, condition: "Patchy light rain with thunder"},
	{code: 1276, thlevel: 0.50, condition: "Moderate or heavy rain with thunder"},
	{code: 1279, thlevel: 0.25, condition: "Patchy light snow with thunder"},
	{code: 1282, thlevel: 0.50, condition: "Moderate or heavy snow with thunder"},
]

// TODO: size?, format?, something or fix this!
const $img = useImage()
const photo = $img(props.texture, { format: 'webp' })

// Listeners
const { width: canvaswidth, height: canvasheight } = useWindowSize()
// set canvas resolution
watch([canvaswidth, canvasheight], () => {
	sandbox.value.setUniform("u_resolution", [canvaswidth, canvasheight])
})
// set uniforms
watch([apidata.value], () => {
	if (sandbox.value && apidata.value) {
		sandbox.value.setUniform("thunder", thunderLevel(apidata.value.current.condition.code))
		sandbox.value.setUniform("temp_c", apidata.value.current.temp_c)
		sandbox.value.setUniform("precip_mm", apidata.value.current.precip_mm)
		apidata.value.current.condition.text = setCondition(apidata.value.current.condition.code)
	}
})

onMounted(() => {
	const iwidth: any = document.getElementById("imgPlaceholder") ? document.getElementById("imgPlaceholder")?.clientWidth : 10
	const iheight: any = document.getElementById("imgPlaceholder")? document.getElementById("imgPlaceholder")?.clientHeight : 10
	// resolve-lygia package:
	Shader.value = resolveLygia(rainFragment)
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
	sandbox.value.setUniform("thunder", thunderLevel(apidata.value?.current.condition.code))
	sandbox.value.setUniform("temp_c", apidata.value?.current.temp_c)
	sandbox.value.setUniform("precip_mm", apidata.value?.current.precip_mm)

	heroLoading.value = false;
})
function thunderLevel(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const thunderLevel = thunderLevels.find((item) => item.code === codeNumber)
	return thunderLevel?.thlevel
}
function setCondition(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const condition = thunderLevels.find((item) => item.code === codeNumber)
	return condition?.condition as string
}
</script>

<template>
	<div id="divPortada" data-anchor="portada" class="relative h-screen">
		<div ref="tweakpane" class="absolute"></div>
		<UButton icon="i-mdi-cog" variant="link" @click="isOpen = true" class="absolute right-0 m-4 z-10" />
		<UModal v-model="isOpen" :overlay="false" class="text-sm">
			<div v-if="apidata" class="p-4 space-y-4">
				<div class="flex items-center space-x-2">
					<span class="w-32 text-right">Rain condition:</span>
					<USelect v-model="apidata.current.condition.code" :options="thunderLevels" option-attribute="condition" value-attribute="code" size="sm" class="w-full" />
				</div>
				<div class="flex items-center space-x-2">
					<span class="w-32 text-right">Temp:</span>
					<URange v-model="apidata.current.temp_c" size="sm" :min="0" :max="40" />
				</div>
				<div class="flex items-center space-x-2">

					<span class="w-32 text-right">Precipitation:</span>
					<URange v-model="apidata.current.precip_mm" size="sm" :min="0" :max="20" :step="0.1" />
				</div>
			</div>
			<span class="text-xs mb-4 text-center text-gray-500">click outside to dismiss or press <UKbd value="Esc" /></span>
		</UModal>

		<canvas ref="heroCanvas" class="sticky top-0 max-h-screen w-full" />

		<div v-show="heroLoading" class="absolute top-0 w-full h-screen flex items-center justify-center bg-black z-40">
			<UAvatar icon="i-mdi-cloud-clock-outline" size="2xl" class="animate-pulse" :ui="{
				background: 'bg-indigo-500 dark:bg-indigo-800',
				text: 'dark:text-white'
			}" />
		</div>
	</div>

	<div class="absolute flex items-end justify-center inset-8">
		<div v-if="apidata" class="bg-gradient-to-t from-gray-950 to-gray-900 flex items-center space-x-4 px-4 py-1 rounded-full">
			<img :src="apidata.current.condition.icon" class="w-8 -mr-3 -ml-2" />
			<h1 class="">{{ apidata.current.condition.text }}</h1>
			<span class="flex items-center">
				<UIcon name="i-mdi-thermometer" />{{ apidata.current.temp_c }} °C
			</span>
			<span class="flex items-center">
				<UIcon name="i-mdi-weather-pouring" />&nbsp;{{ apidata.current.precip_mm }} mm
			</span>
		</div>
	</div>
</template>
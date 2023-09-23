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
const url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=-34.58,-58.39&lang=es'
const options: object = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': config.public.RapidAPIKey,
		'X-RapidAPI-Host': config.public.RapidAPIHost
	},
	lang: 'es'
}
const { data: apidata } = await useFetch<WeatherData>(url, options)
// test weather check
import fakeData from '~/assets/sample-data-rain.json'
if (props.test) {
	apidata.value = fakeData as WeatherData
}

// sandbox
const isOpen = ref(false) // modal
const shader = ref()
const heroCanvas = ref()
const sandbox = ref()
const heroLoading = ref(true)
const expNormals = ref(false)
const hrs = ref(getHourofDay(apidata.value?.location.localtime as string))
const location = useBrowserLocation()
const thunderLevels = [
	{code: 1000, thlevel: 0.00, condition: "Clear", icon: "113"},
	{code: 1003, thlevel: 0.00, condition: "Partly cloudy", icon: "116"},
	{code: 1006, thlevel: 0.00, condition: "Cloudy", icon: "119"},
	{code: 1009, thlevel: 0.00, condition: "Overcast", icon: "122"},
	{code: 1030, thlevel: 0.00, condition: "Mist", icon: "143"},
	{code: 1063, thlevel: 0.00, condition: "Patchy rain possible", icon: "173"},
	{code: 1066, thlevel: 0.00, condition: "Patchy snow possible", icon: "179"},
	{code: 1069, thlevel: 0.00, condition: "Patchy sleet possible", icon: "182"},
	{code: 1072, thlevel: 0.00, condition: "Patchy freezing drizzle possible", icon: "185"},
	{code: 1087, thlevel: 0.00, condition: "Thundery outbreaks possible", icon: "200"},
	{code: 1114, thlevel: 0.00, condition: "Blowing snow", icon: "227"},
	{code: 1117, thlevel: 0.00, condition: "Blizzard", icon: "230"},
	{code: 1135, thlevel: 0.00, condition: "Fog", icon: "248"},
	{code: 1147, thlevel: 0.00, condition: "Freezing fog", icon: "260"},
	{code: 1150, thlevel: 0.00, condition: "Patchy light drizzle", icon: "263"},
	{code: 1153, thlevel: 0.00, condition: "Light drizzle", icon: "266"},
	{code: 1168, thlevel: 0.00, condition: "Freezing drizzle", icon: "281"},
	{code: 1171, thlevel: 0.00, condition: "Heavy freezing drizzle", icon: "284"},
	{code: 1180, thlevel: 0.00, condition: "Patchy light rain", icon: "293"},
	{code: 1183, thlevel: 0.00, condition: "Light rain", icon: "296"},
	{code: 1186, thlevel: 0.00, condition: "Moderate rain at times", icon: "299"},
	{code: 1189, thlevel: 0.00, condition: "Moderate rain", icon: "302"},
	{code: 1192, thlevel: 0.00, condition: "Heavy rain at times", icon: "305"},
	{code: 1195, thlevel: 0.00, condition: "Heavy rain", icon: "308"},
	{code: 1198, thlevel: 0.00, condition: "Light freezing rain", icon: "311"},
	{code: 1201, thlevel: 0.00, condition: "Moderate or heavy freezing rain", icon: "314"},
	{code: 1204, thlevel: 0.00, condition: "Light sleet", icon: "317"},
	{code: 1207, thlevel: 0.00, condition: "Moderate or heavy sleet", icon: "320"},
	{code: 1210, thlevel: 0.00, condition: "Patchy light snow", icon: "323"},
	{code: 1213, thlevel: 0.00, condition: "Light snow", icon: "326"},
	{code: 1216, thlevel: 0.00, condition: "Patchy moderate snow", icon: "329"},
	{code: 1219, thlevel: 0.00, condition: "Moderate snow", icon: "332"},
	{code: 1222, thlevel: 0.00, condition: "Patchy heavy snow", icon: "335"},
	{code: 1225, thlevel: 0.00, condition: "Heavy snow", icon: "338"},
	{code: 1237, thlevel: 0.00, condition: "Ice pellets", icon: "350"},
	{code: 1240, thlevel: 0.00, condition: "Light rain shower", icon: "353"},
	{code: 1243, thlevel: 0.00, condition: "Moderate or heavy rain shower", icon: "356"},
	{code: 1246, thlevel: 1.00, condition: "Torrential rain shower", icon: "359"},
	{code: 1249, thlevel: 0.00, condition: "Light sleet showers", icon: "362"},
	{code: 1252, thlevel: 0.00, condition: "Moderate or heavy sleet showers", icon: "365"},
	{code: 1255, thlevel: 0.00, condition: "Light snow showers", icon: "368"},
	{code: 1258, thlevel: 0.00, condition: "Moderate or heavy snow showers", icon: "371"},
	{code: 1261, thlevel: 0.00, condition: "Light showers of ice pellets", icon: "374"},
	{code: 1264, thlevel: 0.00, condition: "Moderate or heavy showers of ice pellets", icon: "377"},
	{code: 1273, thlevel: 0.25, condition: "Patchy light rain with thunder", icon: "386"},
	{code: 1276, thlevel: 0.50, condition: "Moderate or heavy rain with thunder", icon: "389"},
	{code: 1279, thlevel: 0.25, condition: "Patchy light snow with thunder", icon: "392"},
	{code: 1282, thlevel: 0.50, condition: "Moderate or heavy snow with thunder", icon: "395"},
]

// TODO: size?, format?, something or fix this!
const $img = useImage()
const photo = $img(props.texture, { format: 'webp' })

// Listeners / set uniforms
const { width: canvaswidth, height: canvasheight } = useWindowSize()
watch([canvaswidth, canvasheight, apidata.value], () => {
	updateUniforms()
})

watch([hrs, expNormals], () => {
	// updateConditionData()
	sandbox.value.setUniform("hrs", hrs.value)
	sandbox.value.setUniform("cheap_normals", expNormals ? 1 : 0)
})

onMounted(() => {
	const iwidth: any = document.getElementById("imgPlaceholder") ? document.getElementById("imgPlaceholder")?.clientWidth : 10
	const iheight: any = document.getElementById("imgPlaceholder")? document.getElementById("imgPlaceholder")?.clientHeight : 10
	// resolve-lygia package
	shader.value = resolveLygia(rainFragment)
	// @ts-ignore //this is a hack. glslCanvas is loaded in the head html
	sandbox.value = new GlslCanvas(heroCanvas.value)
	heroCanvas.value.style.width = "100%"
	heroCanvas.value.style.height = "100%"
	// Load resolved shader
	sandbox.value.load(shader.value)
	// Load a new texture and assign it to uniform sampler2D u_texture
	sandbox.value.setUniform("u_tex0", photo)
	sandbox.value.setUniform("u_tex0Resolution", iwidth / iheight)
	// weather
	updateUniforms()
	sandbox.value.setUniform("hrs", hrs.value)
	sandbox.value.setUniform("cheap_normals", expNormals ? 1 : 0)
	heroLoading.value = false
})
function thunderLevel(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const thunderLevel = thunderLevels.find((item) => item.code === codeNumber)
	return thunderLevel?.thlevel
}
function setCondition(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	return matchedCondition?.condition as string
}
function setIcon(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	const dayOrNight = apidata.value?.current.is_day === 1? "day/" : "night/"
	return "/images/weather/64x64/" + dayOrNight + matchedCondition?.icon + ".png"
}
function getHourofDay(dateString: string) {
	const dateObject = new Date(dateString)
	const hour = dateObject.getHours()
	return hour
}
function formatDateFromHour(hour: number) {
	const dateObject = new Date(apidata.value?.location.localtime as string)
	dateObject.setHours(hour)
}
function updateUniforms() {
	if (sandbox.value && apidata.value) {
		const { current } = apidata.value
		const { is_day, temp_c, precip_mm, condition } = current
		// set canvas resolution
		sandbox.value.setUniform("u_resolution", [canvaswidth, canvasheight]) // canvas resolution
		sandbox.value.setUniform("is_day", is_day)
		sandbox.value.setUniform("thunder", thunderLevel(condition.code))
		sandbox.value.setUniform("temp_c", temp_c)
		sandbox.value.setUniform("precip_mm", precip_mm)
	}
}
function updateConditionData() {
	if (apidata.value) {
		const { current } = apidata.value
		const { condition } = current
		apidata.value.current.condition.text = setCondition(condition.code)
		apidata.value.current.condition.icon = setIcon(condition.code)
	}
}
</script>

<template>
	<div id="divPortada" data-anchor="portada" class="relative h-screen">
		<div ref="tweakpane" class="absolute"></div>
		<UButton icon="i-mdi-cog" variant="link" @click="isOpen = true" class="absolute right-0 m-4 z-10" />
		<UModal v-model="isOpen" :overlay="false" class="text-sm" :ui="{container: 'items-start'}">
			<div v-if="apidata" class="p-4 space-y-4">
				<UAlert v-if="location.hostname === 'localhost'" title="" icon="i-mdi-alert-circle-outline" color="yellow" variant="soft">
					<template #title>
						<div class="flex flex-col">
							Debug
						</div>
					</template>
					<template #description>
						<div class="flex flex-col">
							<span>Hora: {{ hrs }}</span>
							<span>Date: {{ apidata?.location ? apidata.location.localtime : '2023-09-07 12:00' }}</span>
							<!-- <span>route: {{ location }}</span> -->
						</div>
					</template>
				</UAlert>
				<div class="flex flex-col md:flex-row md:items-center md:space-x-2">
					<span class="md:w-32 shrink-0">Rain condition:</span>
					<USelect v-model="apidata.current.condition.code" :options="thunderLevels" option-attribute="condition" value-attribute="code" size="sm" class="w-full" />
				</div>
				<div class="flex flex-col md:flex-row md:items-center md:space-x-2">
					<span class="md:w-32 shrink-0">Temp:</span>
					<URange v-model="apidata.current.temp_c" size="sm" :min="0" :max="40" />
				</div>
				<div class="flex flex-col md:flex-row md:items-center md:space-x-2">
					<span class="md:w-32 shrink-0">Precipitation:</span>
					<URange v-model="apidata.current.precip_mm" size="sm" :min="0" :max="20" :step="0.1" />
				</div>
				<div class="flex flex-col md:flex-row md:items-center md:space-x-2">
					<span class="md:w-32 shrink-0">Time:</span>
					<URange v-model="hrs" size="sm" :min="0" :max="24" :step="0.1" />
				</div>
				<UCheckbox v-model="expNormals" name="normals" label="X normals*" />
			</div>
			<span class="text-xs mb-4 text-center text-gray-500">click outside to dismiss or press <UKbd value="Esc" />
			</span>
		</UModal>

		<canvas ref="heroCanvas" class="sticky" />

		<Transition>
			<div v-show="heroLoading" class="absolute top-0 w-full h-screen flex items-center justify-center bg-black z-40">
				<UAvatar icon="i-mdi-cloud-clock-outline" size="2xl" class="animate-pulse" :ui="{
					background: 'bg-indigo-500 dark:bg-indigo-800',
					text: 'dark:text-white'
				}" />
			</div>
		</Transition>
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

	<div class="absolute bottom-4 right-4 text-xs" >
		Powered by <a href="https://www.weatherapi.com/" title="Free Weather API">WeatherAPI.com</a>
	</div>
</template>

<style scoped>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
<script setup lang="ts">
// @ts-ignore
import { resolveLygia } from 'resolve-lygia'
import rainFragment from '~/assets/shaders/rain.frag?raw'
import fakeData from '~/assets/sample-data-rain.json'
// import GlslCanvas from 'glslCanvas'

//TODO: use package or minified js
useHead({
	script: [{
		type: 'text/javascript',
		src: 'https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js',
	}]
})

const config = useRuntimeConfig()
const { isMobile } = useDevice()
const location = useBrowserLocation()
const { width: canvaswidth, height: canvasheight } = useWindowSize()

// sandbox
/* Define props */
interface Props {
	texture: string,
	test: boolean,
	latitude: number,
	longitude: number,
}

const props: Props = defineProps({
	texture: { type: String, default: '/images/TimeToForest_3.png' },
	test: { type: Boolean, default: false },
	latitude: { type: Number, default: -34.58 },
	longitude: { type: Number, default: -58.39 }
})

const isOpen = ref(location.value.hostname === 'localhost')//debug modal
const shader = ref()
const cheapNormals = ref(isMobile ? true : false)
const heroCanvas = ref()
const sandbox = ref()
const heroLoading = ref(true)
const thunderLevels = [
	{ code: 1000, thlevel: 0.00, text: "Clear", icon: "113" },
	{ code: 1003, thlevel: 0.00, text: "Partly cloudy", icon: "116" },
	{ code: 1006, thlevel: 0.00, text: "Cloudy", icon: "119" },
	{ code: 1009, thlevel: 0.00, text: "Overcast", icon: "122" },
	{ code: 1030, thlevel: 0.00, text: "Mist", icon: "143" },
	{ code: 1063, thlevel: 0.00, text: "Patchy rain possible", icon: "173" },
	{ code: 1066, thlevel: 0.00, text: "Patchy snow possible", icon: "179" },
	{ code: 1069, thlevel: 0.00, text: "Patchy sleet possible", icon: "182" },
	{ code: 1072, thlevel: 0.00, text: "Patchy freezing drizzle possible", icon: "185" },
	{ code: 1087, thlevel: 0.00, text: "Thundery outbreaks possible", icon: "200" },
	{ code: 1114, thlevel: 0.00, text: "Blowing snow", icon: "227" },
	{ code: 1117, thlevel: 0.00, text: "Blizzard", icon: "230" },
	{ code: 1135, thlevel: 0.00, text: "Fog", icon: "248" },
	{ code: 1147, thlevel: 0.00, text: "Freezing fog", icon: "260" },
	{ code: 1150, thlevel: 0.00, text: "Patchy light drizzle", icon: "263" },
	{ code: 1153, thlevel: 0.00, text: "Light drizzle", icon: "266" },
	{ code: 1168, thlevel: 0.00, text: "Freezing drizzle", icon: "281" },
	{ code: 1171, thlevel: 0.00, text: "Heavy freezing drizzle", icon: "284" },
	{ code: 1180, thlevel: 0.00, text: "Patchy light rain", icon: "293" },
	{ code: 1183, thlevel: 0.00, text: "Light rain", icon: "296" },
	{ code: 1186, thlevel: 0.00, text: "Moderate rain at times", icon: "299" },
	{ code: 1189, thlevel: 0.00, text: "Moderate rain", icon: "302" },
	{ code: 1192, thlevel: 0.00, text: "Heavy rain at times", icon: "305" },
	{ code: 1195, thlevel: 0.00, text: "Heavy rain", icon: "308" },
	{ code: 1198, thlevel: 0.00, text: "Light freezing rain", icon: "311" },
	{ code: 1201, thlevel: 0.00, text: "Moderate or heavy freezing rain", icon: "314" },
	{ code: 1204, thlevel: 0.00, text: "Light sleet", icon: "317" },
	{ code: 1207, thlevel: 0.00, text: "Moderate or heavy sleet", icon: "320" },
	{ code: 1210, thlevel: 0.00, text: "Patchy light snow", icon: "323" },
	{ code: 1213, thlevel: 0.00, text: "Light snow", icon: "326" },
	{ code: 1216, thlevel: 0.00, text: "Patchy moderate snow", icon: "329" },
	{ code: 1219, thlevel: 0.00, text: "Moderate snow", icon: "332" },
	{ code: 1222, thlevel: 0.00, text: "Patchy heavy snow", icon: "335" },
	{ code: 1225, thlevel: 0.00, text: "Heavy snow", icon: "338" },
	{ code: 1237, thlevel: 0.00, text: "Ice pellets", icon: "350" },
	{ code: 1240, thlevel: 0.00, text: "Light rain shower", icon: "353" },
	{ code: 1243, thlevel: 0.00, text: "Moderate or heavy rain shower", icon: "356" },
	{ code: 1246, thlevel: 1.00, text: "Torrential rain shower", icon: "359" },
	{ code: 1249, thlevel: 0.00, text: "Light sleet showers", icon: "362" },
	{ code: 1252, thlevel: 0.00, text: "Moderate or heavy sleet showers", icon: "365" },
	{ code: 1255, thlevel: 0.00, text: "Light snow showers", icon: "368" },
	{ code: 1258, thlevel: 0.00, text: "Moderate or heavy snow showers", icon: "371" },
	{ code: 1261, thlevel: 0.00, text: "Light showers of ice pellets", icon: "374" },
	{ code: 1264, thlevel: 0.00, text: "Moderate or heavy showers of ice pellets", icon: "377" },
	{ code: 1273, thlevel: 0.25, text: "Patchy light rain with thunder", icon: "386" },
	{ code: 1276, thlevel: 0.50, text: "Moderate or heavy rain with thunder", icon: "389" },
	{ code: 1279, thlevel: 0.25, text: "Patchy light snow with thunder", icon: "392" },
	{ code: 1282, thlevel: 0.50, text: "Moderate or heavy snow with thunder", icon: "395" },
]

// api weather
const url = computed(() => {
	return 'https://weatherapi-com.p.rapidapi.com/current.json?q='+props.latitude+','+props.longitude
})
const options: object = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': config.public.RapidAPIKey,
		'X-RapidAPI-Host': config.public.RapidAPIHost
	},
	lang: 'es',
	immediate: false,
	watch: false
}
const { data:apidata, pending, error, refresh } = await useFetch<WeatherData>(url, options)
if (props.test) apidata.value = fakeData as WeatherData

const isDay = ref(apidata.value?.current.is_day === 1 ? true : false) // [0,1]
const hrs = ref(getHourofDay(apidata.value?.location.localtime as string))

//TODO: size?, format?, something or fix this!
const $img = useImage()
const photo = $img(props.texture, { format: 'webp' })
// test weather check
function thunderLevel(code: any) {
	const codeNumber = typeof code === "number" ? code : parseInt(code)
	const thunderLevel = thunderLevels.find((item) => item.code === codeNumber)
	return thunderLevel?.thlevel
}
function getHourofDay(dateString: string) {
	const dateObject = new Date(dateString)
	const hour = dateObject.getHours()
	return hour
}
function updateUniforms() {
	if (sandbox.value && apidata.value) {
		const { current } = apidata.value
		const { is_day, temp_c, humidity, precip_mm, condition } = current
		sandbox.value.setUniform("u_resolution", [canvaswidth, canvasheight]) // canvas resolution
		sandbox.value.setUniform("is_day", is_day)
		sandbox.value.setUniform("thunder", thunderLevel(condition.code))
		sandbox.value.setUniform("temp_c", temp_c)
		sandbox.value.setUniform("precip_mm", precip_mm)
		sandbox.value.setUniform("humidity", humidity)
		sandbox.value.setUniform("cheap_normals", computedCheapNormals.value)
	}
}
const computedCheapNormals = computed(() => isMobile ? 1 : 0)
function setCondition(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	return matchedCondition?.text as string
}
const setIcon = computed(() => {
	const code: any = apidata.value?.current.condition.code
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	const dayOrNight = apidata.value?.current.is_day ? "day/" : "night/"
	return "/images/weather/64x64/" + dayOrNight + matchedCondition?.icon + ".png"
})

onMounted(() => {
	const iwidth: any = document.getElementById("imgPlaceholder") ? document.getElementById("imgPlaceholder")?.clientWidth : 10
	const iheight: any = document.getElementById("imgPlaceholder") ? document.getElementById("imgPlaceholder")?.clientHeight : 10
	//fetch api data
	refresh()
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
	sandbox.value.setUniform("cheap_normals", computedCheapNormals.value)
	heroLoading.value = false
})

//Listeners / set uniforms
watch([canvaswidth, canvasheight, apidata.value], () => {
	updateUniforms()
})

//TODO: Debug listeners (avoid on production)
watch([hrs, cheapNormals, isDay], () => {
	sandbox.value.setUniform("hrs", hrs.value)
	sandbox.value.setUniform("cheap_normals", cheapNormals.value ? 1 : 0)
	if(apidata.value) {apidata.value.current.is_day = isDay.value ? 1 : 0}
})
//end debug listeners
</script>

<template>
	<div id="divPortada" class="relative hero-area">
		<UButton icon="i-mdi-cog" color="amber" variant="link" @click="isOpen = true" class="absolute right-0 m-4 z-10" />
		<canvas ref="heroCanvas" class="sticky" />
		<UModal v-model="isOpen" :overlay="false">
			<UCard v-if="apidata">
				<div class="space-y-4 text-sm">

					<UAlert v-if="location.hostname === 'localhost'" title="" icon="i-mdi-alert-circle-outline" color="yellow"
						variant="soft" :ui="{ padding: 'p-2' }">
						<template #description>
							<div class="flex flex-col text-xs">
								<span>Props location: {{ props.latitude }}, {{ props.longitude }}</span>
							</div>
						</template>
					</UAlert>

					<h1 class="text-base">{{ apidata.location.name }}</h1>
					<UFormGroup label="Condition">
						<USelect
							v-model="apidata.current.condition.code"
							:options="thunderLevels"
							value-attribute="code"
							option-attribute="text"
							size="sm"
						/>
					</UFormGroup>
					<UFormGroup :label="'Temperature: ' + apidata.current.temp_c + '°C'">
						<URange v-model="apidata.current.temp_c" size="sm" :min="0" :max="40" />
					</UFormGroup>
					<UFormGroup :label="'Precipitation: ' + apidata.current.precip_mm + ' mm'">
						<URange v-model="apidata.current.precip_mm" size="sm" :min="0" :max="20" />
					</UFormGroup>
					<UFormGroup :label="'Humidity: ' + apidata.current.humidity + '%'">
						<URange v-model="apidata.current.humidity" size="sm" :min="0" :max="100" />
					</UFormGroup>
					<UFormGroup :label="'Time: '+ hrs + ':00'">
						<URange v-model="hrs" size="sm" :min="0" :max="24" />
					</UFormGroup>
					<div class="flex space-x-8 justify-around">
						<UFormGroup label="Cheap normals">
							<UToggle v-model="cheapNormals" />
						</UFormGroup>
						<UFormGroup label="Night / Day">
							<UToggle v-model="isDay" />
						</UFormGroup>
					</div>
				</div>
				<template #footer>
					<div class="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-center justify-center text-xs text-gray-500">
						<span>
							<span>click outside to dismiss</span>
							<span v-if="!isMobile"> or press <UKbd value="Esc" /></span>
						</span>
						<span class="hidden sm:inline">/</span>
						<span>Powered by <a href="https://www.weatherapi.com/" target="_blank" title="Free Weather API">WeatherAPI.com</a></span>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- <Transition>
			<div v-show="heroLoading" class="absolute top-0 w-full h-screen flex items-center justify-center bg-black z-40">
				<UAvatar icon="i-mdi-cloud-clock-outline" size="2xl" class="animate-pulse" :ui="{
					background: 'bg-indigo-500 dark:bg-indigo-800',
					text: 'dark:text-white'
				}" />
			</div>
		</Transition> -->
	</div>
	
	<!-- Weather Pill -->
	<Transition>
		<div v-if="!heroLoading" class="absolute bottom-20 flex items-end justify-center w-full">
			<UBadge :color="apidata?.current.is_day ? 'amber' : 'gray'" variant="soft" size="lg" class="whitespace-nowrap text-base min-w-max px-4" :ui="{ rounded: 'rounded-full' }">
				<UTooltip :text="setCondition(apidata?.current.condition.code)" class="flex-shrink-0">
					<img :src="setIcon" />
				</UTooltip>
				<span class="flex items-center pr-4"><UIcon name="i-mdi-thermometer" />{{ apidata?.current.temp_c }} °C</span>
				<span class="flex items-center pr-2"><UIcon name="i-mdi-weather-pouring" />&nbsp;{{ apidata?.current.precip_mm }} mm</span>
			</UBadge>
		</div>
	</Transition>
	<!-- Weather Pill -->

</template>

<style scoped>
.hero-area {
	height: 100dvh;
	width: 100%;
}

.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
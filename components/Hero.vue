<script setup lang="ts">
// @ts-ignore
import { resolveLygia } from 'resolve-lygia'
import rainFragment from '~/assets/shaders/rain.frag?raw'
// import GlslCanvas from 'glslCanvas'

const config = useRuntimeConfig()
const { isMobile } = useDevice()
const location = useBrowserLocation()
const { width: canvaswidth, height: canvasheight } = useWindowSize()

//TODO: use package or minified js
useHead({
	script: [{
		type: 'text/javascript',
		src: 'https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js',
	}]
})

//fetch api data
const { coords, error: coordsError, resume, pause } = useGeolocation({ enableHighAccuracy: true, timeout: 5000 })
const url = computed(() => {
	return 'https://weatherapi-com.p.rapidapi.com/current.json?q=' + coords.value.latitude + ',' + coords.value.longitude
	// return 'https://weatherapi-cosm.p.rapippp.com/current.json' //test bad request
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
const { data, pending, error } = await useFetch<WeatherData>(url, options)

// sandbox
const heroCanvas = ref()
const sandbox = ref()
const shader = ref()
const HDNormals = ref(isMobile ? false : true)
const computedCheapNormals = computed(() => isMobile ? 0 : 1)
const isOpen = ref(location.value.hostname === 'localhost')//debug modal

const fps = useFps()
const now = ref(new Date())
const timeAgo = useTimeAgo(now)

//TODO: size?, format?, something or fix this!
// const $img = useImage()
const settings = useSettings()
const photo = getPictureById(settings.backgroundPicture)

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

const isDayAndHrs = ref({
	isDay: data.value?.current.is_day === 1 ? true : false,
	hrs: 0
})

function thunderLevel(code: any) {
	const codeNumber = typeof code === "number" ? code : parseInt(code)
	const thunderLevel = thunderLevels.find((item) => item.code === codeNumber)
	return thunderLevel?.thlevel
}

function updateHours() {
	isDayAndHrs.value.isDay = data.value?.current.is_day === 1 ? true : false
	isDayAndHrs.value.hrs = new Date(data.value?.location.localtime as string).getHours()
}

/**
 * Refresh all data and update the weather display.
 *
 * @return {Promise<void>} A promise that resolves when the data has been refreshed.
 */
const refreshAll = async (): Promise<void> => {
	console.log("Refetching...")
	try {
		await refreshNuxtData()
	} finally {
		// weather
		now.value = new Date()
		updateUniforms()
		updateHours()
	}
}

/* Updates the uniforms for the shader program. */
function updateUniforms(): void {
	if (data.value) {
		const { current } = data.value
		const { temp_c = 0, humidity = 0, precip_mm = 0, condition = {text: "offline", icon: "", code: 0} } = current
		sandbox.value.setUniform("hrs", isDayAndHrs.value.hrs)
		sandbox.value.setUniform("thunder", thunderLevel(condition.code))
		sandbox.value.setUniform("temp_c", temp_c)
		sandbox.value.setUniform("precip_mm", precip_mm)
		sandbox.value.setUniform("humidity", humidity)
		sandbox.value.setUniform("hd_normals", computedCheapNormals.value)
	}
}

onMounted(() => {
	// resolve-lygia package
	shader.value = resolveLygia(rainFragment)
	// @ts-ignore this is a //HACK. glslCanvas is loaded in the head html
	sandbox.value = new GlslCanvas(heroCanvas.value)
	// Load resolved shader
	sandbox.value.load(shader.value)
	// Load a new texture and assign it to uniform sampler2D u_texture
	sandbox.value.setUniform("u_tex0", photo)
	// resize canvas
	heroCanvas.value.width = canvaswidth.value
	heroCanvas.value.height = canvasheight.value
	updateHours()
})

// #region Listeners / set uniforms
watchOnce(coords, () => {
	if (coords.value.latitude !== Infinity) refreshAll()
})

// Watch for deep changes in the 'data' variable
watchDeep(data, () => {
	// Call the 'updateUniforms' function
	updateUniforms()
})

watch(timeAgo, () => timeAgo.value !== "just now" ? refreshAll() : null )

//TODO: Debug listeners (avoid on production):
watch([isDayAndHrs.value, HDNormals], () => {
	sandbox.value.setUniform("hrs", isDayAndHrs.value.hrs)
	sandbox.value.setUniform("hd_normals", HDNormals.value ? 1 : 0)
	if (data.value) { data.value.current.is_day = isDayAndHrs.value.isDay ? 1 : 0 }
})

// Subscribe to the settings object and get the state object
settings.$subscribe((_, state) => {
	// Set the uniform "u_tex0" in the sandbox value with the value of state.backgroundPicture
	sandbox.value.setUniform("u_tex0", getPictureById(state.backgroundPicture))
})

// #endregion debug listeners
</script>

<template>

	<canvas ref="heroCanvas" class="fixed" />

	<WeatherPill :data="data" :error="error" :pending="pending" :coords="coords" :location_error="coordsError" />

	<UButton icon="i-mdi-cog" color="amber" variant="link" @click="isOpen = true" class="absolute right-0 m-4 z-10" />

	<div class="modal-area">
		<UModal v-model="isOpen" :overlay="false">
			<UCard>

				<div class="space-y-4 divide-y divide-gray-700">

					<section id="user-settings" class="flex space-x-8 justify-between">

						<UFormGroup :label="$t('locale')">
							<LocaleSelect />
						</UFormGroup>

						<UFormGroup :label="$t('hd_normals')">
							<UCheckbox v-model="HDNormals" />
						</UFormGroup>

						<UFormGroup :label="$t('background')">
							<ChooseBackground />
						</UFormGroup>

					</section>

					<section v-if="data" id="weather-settings" class="space-y-4 pt-4">						
						<div class="flex justify-between">
							<h1 class="text-lg">
								{{ data?.location.name ? data.location.name : $t('no_network') }}
								<UButton
									:disabled="pending"
									@click="refreshAll"
									:color="data ? 'gray' : 'red'" :label="$t('update')"
									icon="i-mdi-refresh"
									size="2xs"
									variant="outline"
								/>
							</h1>
							<div class="flex items-center space-x-2 text-sm">
								<span>{{ $t('night_day') }}</span>
								<UToggle v-model="isDayAndHrs.isDay" />
							</div>
						</div>
					
						<UFormGroup :label="$t('condition')">
							<USelect
								v-model="data.current.condition.code"
								:options="thunderLevels"
								value-attribute="code"
								option-attribute="text"
								size="sm"
							/>
						</UFormGroup>
						<UFormGroup :label="$t('temperature') + ': ' + data.current.temp_c + '°C'">
							<URange v-model="data.current.temp_c" size="sm" :min="0" :max="40" />
						</UFormGroup>
						<UFormGroup :label="$t('precipitation') + ': ' + data.current.precip_mm + ' mm'">
							<URange v-model="data.current.precip_mm" size="sm" :min="0" :max="1" :step="0.01" />
						</UFormGroup>
						<UFormGroup :label="$t('humidity') + ': ' + data.current.humidity + '%'">
							<URange v-model="data.current.humidity" size="sm" :min="0" :max="100" />
						</UFormGroup>
						<UFormGroup :label="$t('time') + ': ' + isDayAndHrs.hrs + ':00'">
							<URange v-model="isDayAndHrs.hrs" size="sm" :min="0" :max="24" />
						</UFormGroup>

						<UAlert v-if="location.hostname === 'localhost'" icon="i-mdi-bug" color="yellow" variant="soft" title="" :ui="{ padding: 'p-2' }">
							<template #description>
								<div class="flex flex-col text-xs space-y-2">
									<span>{{ now }}</span>
									<!-- <span>useGeolocation: {{ coords.latitude }}, {{ coords.longitude }}</span> -->
									<span>FPS: {{ fps }}</span>
								</div>
							</template>
						</UAlert>

					</section>

				</div>

				<template #footer>
					<div class="flex flex-col space-y-2 items-center text-sm text-gray-500">

						<div>
							<span>{{ $t('dismiss_modal') }}</span>
							<span v-if="!isMobile">{{ $t('or_press') }} <UKbd value="Esc" /></span>
						</div>

						<span>{{ $t('powered_by') }}<a href="https://www.weatherapi.com/" target="_blank" title="Free Weather API">WeatherAPI.com</a> {{ timeAgo }}</span>

					</div>
				</template>

			</UCard>
		</UModal>
	</div>

</template>

<style>
.modal-area, #__nuxt, html, canvas {
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
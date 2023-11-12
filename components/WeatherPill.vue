<template>
	<div>
		<Transition>
			<div class="absolute bottom-20 flex items-end justify-center w-full select-none">
				<UBadge
					color="white"
					variant="solid"
					size="md"
					:ui="{ rounded: 'rounded-full', size: { md: 'whitespace-nowrap px-4' } }"
				>

						<section v-if="data" class="flex items-center text-xl">
							<UTooltip :text="setCondition(data?.current.condition.code)" class="flex-shrink-0 -ml-3">
								<img :src="setIcon" width="64" height="64" :alt="$t('condition')" />
							</UTooltip>
							<span class="flex items-center pr-4">
								<UIcon name="i-mdi-thermometer" />{{ data?.current.temp_c }} °C
							</span>
							<span class="flex items-center pr-4">
								<UIcon name="i-mdi-water-percent" />{{ data?.current.humidity }} %
							</span>
							<span v-if="data?.current.precip_mm && data?.current.precip_mm > 0" class="flex items-center pr-2">
								<UIcon name="i-mdi-weather-pouring" />&nbsp;{{ data?.current.precip_mm }} mm
							</span>
						</section>
						<section v-else class="flex items-center space-x-2">
							<UIcon :name="props.pending ? 'i-mdi-refresh' : 'i-mdi-alert-circle-outline'" class="w-8 h-8 -ml-3" />
							<div class="flex flex-col">

								<TransitionGroup>
									<span
										v-show="error"
										key="error"
									>
										{{ $t('api_error') }}
									</span>

									<span
										v-show="coords?.latitude !== Infinity"
										key="coords"
										:class="props.pending ? 'text-amber-500' : 'text-red-500'"
									>
										{{ props.pending ? $t('pending') : $t('no_network') }}
									</span>

									<span
										v-show="coords?.latitude === Infinity"
										key="location"
									>
										{{ location_error ? $t('no_location') : $t('locating') }}
									</span>
								</TransitionGroup>

							</div>
						</section>
				</UBadge>
			</div>
		</Transition>
	</div>
</template>

<script lang="ts" setup>
/* Define props */
const props = defineProps({
	coords: { type: Object, required: false },
	location_error: { type: String },
	data: { type: Object as PropType<WeatherData>, required: false },
	error: { type: Boolean, default: false },
	pending: { type: Boolean, default: true }
})

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

const pillColor = computed(() => {
	if (props.data) {
		return props.data.current.is_day ? 'amber' : 'indigo'
	}
	if (props.error) {
		return 'red'
	}
})

function setCondition(code: any) {
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	return matchedCondition?.text as string
}

const setIcon = computed(() => {
	const code: any = props.data?.current.condition.code
	const codeNumber = typeof code === "number"? code : parseInt(code)
	const matchedCondition = thunderLevels.find((item) => item.code === codeNumber)
	const dayOrNight = props.data?.current.is_day ? "day/" : "night/"
	return "/images/weather/64x64/" + dayOrNight + matchedCondition?.icon + ".png"
})
</script>
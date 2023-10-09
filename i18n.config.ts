export default defineI18nConfig(() => ({
	legacy: false,
	locale: "en",
	messages: {
		en: {
			locale: "Language",
			welcome: "Welcome",
			condition: "Condition",
			temperature: "Temperature",
			precipitation: "Precipitation",
			humidity: "Humidity",
			api_error: "Could not load weather data",
			no_network: "No network connection",
			update: "Update",
			time: "Time",
			cheap_normals: "HD Rain",
			night_day: "Night / Day",
			dismiss_modal: "Click outside to dismiss",
			or_press: " or press",
			powered_by: "Powered by ",
		},
		es: {
			locale: "Idioma",
			welcome: "Bienvenido",
			condition: "Condición",
			temperature: "Temperatura",
			precipitation: "Precipitación",
			humidity: "Humedad",
			api_error: "No se pudo cargar los datos del clima",
			no_network: "Sin conexión a Internet",
			update: "Actualizar",
			time: "Hora",
			cheap_normals: "Lluvia HD",
			night_day: "Noche / Dia",
			dismiss_modal: "Haz click fuera para cerrarlo",
			or_press: " o presiona",
			powered_by: "Datos de ",
		},
	},
}));

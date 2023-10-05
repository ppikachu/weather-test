<template>
	<form>
		<USelect
			v-model="locale"
			:options="locales"
			value-attribute="id"
			option-attribute="label"
			class="max-w-fit"
			size="xs"
		/>
		<!-- <USelectMenu v-model="locale" :options="locales" value-attribute="id" option-attribute="label">
			<template #label>
				<UIcon :name="selected.icon" class="w-4 h-4" />
				{{ selected.label }}
			</template>
		</USelectMenu> -->
	</form>
</template>

<script lang="ts" setup>
const { locale } = useI18n()
const locales = [{
	id: 'en',
	label: 'English',
	icon: 'i-heroicons-user-circle'
},
{
	id: 'es',
	label: 'Spanish',
	icon: 'i-heroicons-user-circle'
}]
const selected = ref(locales[0])
</script>
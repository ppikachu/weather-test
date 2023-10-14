<template>
	<USelectMenu v-model="selected" :options="importedPictures">
		<template #label>
			<UAvatar v-bind="selected.avatar" size="3xs" />
			{{ selected.label }}
		</template>
	</USelectMenu>
</template>

<script lang="ts" setup>
const importedPictures = backgroundPictures()
const selected = ref(importedPictures.value[0])
const settings = useSettings()

watch(selected, () => {
	settings.value = selected.value.href
})
</script>
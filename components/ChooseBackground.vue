<template>
	<USelectMenu v-model="selected" :options="importedPictures">
		<template #label>
			<UAvatar v-bind="selected?.avatar" size="3xs" />
			{{ selected?.label }}
		</template>
	</USelectMenu>
</template>

<script lang="ts" setup>
const importedPictures = backgroundPictures()
const settings = useSettings()
const picture = ref(importedPictures.value.find((picture) => picture.id === settings.backgroundPicture))
const selected = ref(picture.value)

watch(selected, () => {
	settings.$patch({ backgroundPicture: selected.value?.id })
})
</script>
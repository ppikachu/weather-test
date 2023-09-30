<script setup lang="ts">
const showInstall = computed(() =>{
	return useNuxtApp().$pwa.showInstallPrompt
	// return true
})
</script>

<template>
	<main>
		<slot />

		<ClientOnly>
			<UContainer v-if="showInstall" class="absolute top-4 w-full z-20 ">
				<UCard class="max-w-fit">
					<span>Install PWA</span>
					<template #footer>
						<div class="space-x-2">
							<UButton @click="$pwa.install()">Install</UButton>
							<UButton @click="$pwa.cancelInstall()">Cancel</UButton>
						</div>
					</template>
				</UCard>
			</UContainer>
		</ClientOnly>

	</main>
</template>
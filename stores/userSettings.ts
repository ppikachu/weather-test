export const useSettings = defineStore('userSettings', {
	// arrow function recommended for full type inference
	state: () => {
		return {
			// all these properties will have their type inferred automatically
			units: 'degrees',
			backgroundPicture: 'hedges',
		}
	},
	persist: { storage: persistedState.localStorage }
})
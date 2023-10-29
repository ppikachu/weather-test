export const backgroundPictures = () => useState('backgroundPictures', () => [
	{
		id: 'Forest',
		label: 'Forest',
		href: '/images/a-forest.jpg',
		avatar: { src: '/images/a-forest.jpg' }
	},
	{
		id: 'hedges',
		label: 'Hedges',
		href: '/images/hedges-6-l.jpg',
		avatar: { src: '/images/hedges-6-l.jpg' }
	},
	{
		id: 'lips',
		label: 'Lips',
		href: '/images/lips-1-l.jpg',
		avatar: { src: '/images/lips-1-l.jpg' }
	},
	{
		id: 'lips-2',
		label: 'Lips 2',
		href: '/images/lips-2-l.jpg',
		avatar: { src: '/images/lips-2-l.jpg' }
	},
])

// Refactored function to retrieve a picture by its ID from a list of background pictures
export function getPictureById(id: string) {
	// Retrieve the list of background pictures
	const pictures = backgroundPictures()
	// Find the picture with the matching ID
	return pictures.value.find((picture) => picture.id === id)?.href
}
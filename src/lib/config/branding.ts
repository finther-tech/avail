// Branding Configuration
// Modify these values to update branding throughout the application

export const BRANDING = {
	// System name
	SYSTEM_NAME: 'Avail',
	SYSTEM_FULL_NAME: 'Avail Room Booking',

	// Application name (for AI assistant references)
	APP_NAME: 'Avail AI',

	// Version
	VERSION: '1.0.0',

	// Page titles
	PAGE_TITLES: {
		HOME: 'Room Booking',
		ROOM: 'Room Status',
		BOOK: 'Book Room',
		ASK: 'Avail AI'
	}
} as const;

// Company options for booking form (client companies using the system)
export const COMPANIES = [
	{ value: 'finther', label: 'Finther' },
	{ value: 'dgb', label: 'DGB' }
] as const;

// Room carousel images
// Alpha Room uses Finther images, Bravo Room uses DGB images
export const ROOM_CAROUSEL_IMAGES = {
	alpha: [
		'/images/finther (1).jpeg',
		'/images/finther (2).jpeg',
		'/images/finther (3).jpeg',
		'/images/finther (4).jpeg'
	],
	bravo: [
		'/images/DGB (1).jpeg',
		'/images/DGB (2).jpeg',
		'/images/DGB (3).jpeg',
		'/images/DGB (4).jpeg',
		'/images/DGB (5).jpeg',
		'/images/DGB (6).jpeg'
	]
} as const;

// Room thumbnail (fallback single image)
export const ROOM_IMAGES = {
	alpha: {
		thumbnail: '/images/finther-square.png'
	},
	bravo: {
		thumbnail: '/images/DGB-square.png'
	}
} as const;

// System assets
export const ASSETS = {
	logo: '/images/avail-words-logo.jpeg',
	logoSvg: '/images/availfavicon.svg',
	favicon: '/images/availfavicon.svg'
} as const;

// Room configuration
export const ROOM_CONFIG = {
	floor: 'Level 5',
	alpha: { capacity: 12 },
	bravo: { capacity: 8 }
} as const;

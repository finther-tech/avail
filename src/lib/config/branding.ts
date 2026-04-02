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
	{ value: 'finther', label: 'Finther Tecnologica (FINTEC)', shortName: 'FINTEC', color: '#9333ea', logo: 'fintec.png' }, // Purple
	{ value: 'dgb', label: 'Diversified Gateway Berhad (DGB)', shortName: 'DGB', color: '#2563eb', logo: 'dgb.png' }, // Blue
	{ value: 'divfex', label: 'Divfex Berhad (Divfex)', shortName: 'Divfex', color: '#dc2626', logo: 'divfex.png' } // Red
] as const;

// Company colors for badges and calendar
export const COMPANY_COLORS = {
	finther: '#9333ea', // Purple
	dgb: '#2563eb', // Blue
	divfex: '#dc2626' // Red
} as const;

// Room carousel images
// Alpha Room uses finther&DGB images, Bravo Room uses finther images
export const ROOM_CAROUSEL_IMAGES = {
	alpha: [
		'/alpha-room/alpha-room.jpeg',
		'/alpha-room/alpha-room-2.jpeg',
		'/alpha-room/alpha-room-3.jpeg'
	],
	bravo: [
		'/images/finther (1).jpeg',
		'/images/finther (2).jpeg',
		'/images/finther (3).jpeg',
		'/images/finther (4).jpeg'
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
	alpha: { capacity: 12, location: 'FINTEC Level 5 • Main Entrance (Beside Main Door)' },
	bravo: { capacity: 8, location: 'FINTEC Level 5 • Working Space Meeting Room' }
} as const;

// Footer credits
export const FOOTER = {
	builtBy: 'Finther Tecnologica Sdn Bhd'
} as const;

import type { PageServerLoad } from './$types';
import { getRoom, getCurrentBooking, getNextBooking } from '$lib/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const roomId = params.id;

	try {
		// Fetch room data
		const room = await getRoom(roomId);

		if (!room) {
			return {
				room: null,
				is_available: true,
				current_booking: null,
				next_booking: null,
				minutes_until_free: 0
			};
		}

		// Fetch bookings
		const currentBooking = await getCurrentBooking(roomId);
		const nextBooking = await getNextBooking(roomId);

		// Calculate minutes until free
		let minutesUntilFree = 0;
		if (currentBooking) {
			const endTime = new Date(currentBooking.end_time);
			const now = new Date();
			minutesUntilFree = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
		}

		return {
			room,
			is_available: !currentBooking,
			current_booking: currentBooking,
			next_booking: nextBooking,
			minutes_until_free: minutesUntilFree
		};
	} catch (error) {
		console.error('Error loading room:', error);
		// Return defaults on error
		return {
			room: { id: roomId, name: roomId.charAt(0).toUpperCase() + roomId.slice(1) + ' Room' },
			is_available: true,
			current_booking: null,
			next_booking: null,
			minutes_until_free: 0
		};
	}
};

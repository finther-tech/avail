import type { PageServerLoad } from './$types';
import { getRoom, getCurrentBooking, getNextBooking } from '$lib/db/queries';
import { supabase } from '$lib/db/supabase';

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
				minutes_until_free: 0,
				weekBookings: [],
				allBookings: []
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

		// Get this week's bookings (Monday to Friday)
		const now = new Date();
		const dayOfWeek = now.getUTCDay();
		const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));
		const endOfWeek = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 7));

		const { data: weekBookings } = await supabase
			.from('bookings')
			.select('*, companies(name)')
			.eq('room_id', roomId)
			.gte('start_time', startOfWeek.toISOString())
			.lt('start_time', endOfWeek.toISOString())
			.order('start_time');

		// Get ALL upcoming bookings (starting from now)
		const { data: allBookings } = await supabase
			.from('bookings')
			.select('*, companies(name)')
			.eq('room_id', roomId)
			.gte('start_time', new Date().toISOString())
			.order('start_time');

		// Flatten company names
		const processedWeekBookings = (weekBookings || []).map((booking: any) => ({
			...booking,
			company_name: booking.companies?.name
		}));

		const processedAllBookings = (allBookings || []).map((booking: any) => ({
			...booking,
			company_name: booking.companies?.name
		}));

		return {
			room,
			is_available: !currentBooking,
			current_booking: currentBooking,
			next_booking: nextBooking,
			minutes_until_free: minutesUntilFree,
			weekBookings: processedWeekBookings,
			allBookings: processedAllBookings
		};
	} catch (error) {
		console.error('Error loading room:', error);
		// Return defaults on error
		return {
			room: { id: roomId, name: roomId.charAt(0).toUpperCase() + roomId.slice(1) + ' Room' },
			is_available: true,
			current_booking: null,
			next_booking: null,
			minutes_until_free: 0,
			weekBookings: [],
			allBookings: []
		};
	}
};

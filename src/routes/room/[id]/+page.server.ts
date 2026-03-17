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

		// Get bookings for the next 30 days for the weekly calendar
		// We fetch a wider range and filter on client based on user's local timezone
		const now = new Date();
		const calendarStartDate = new Date(now);
		calendarStartDate.setHours(0, 0, 0, 0);
		const calendarEndDate = new Date(calendarStartDate);
		calendarEndDate.setDate(calendarStartDate.getDate() + 30);

		const { data: weekBookings } = await supabase
			.from('bookings')
			.select('*, companies(name)')
			.eq('room_id', roomId)
			.gte('start_time', calendarStartDate.toISOString())
			.lt('start_time', calendarEndDate.toISOString())
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

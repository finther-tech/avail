import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getRoom, checkAvailability, createBooking } from '$lib/db/queries';

export const load: PageServerLoad = async ({ params }) => {
	const roomId = params.id;

	// Get room info
	const room = await getRoom(roomId);

	if (!room) {
		throw new Error('Room not found');
	}

	return {
		room
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const roomId = params.id;
		const data = await request.formData();

		const date = data.get('date') as string;
		const startTime = data.get('start_time') as string;
		const duration = parseInt(data.get('duration') as string);
		const title = data.get('title') as string;
		const companyId = data.get('company') as string;

		// Validate
		if (!date || !startTime || !duration || !title || !companyId) {
			return fail(400, { error: 'Please fill in all fields' });
		}

		// Parse and validate dates
		const startDateTime = new Date(`${date}T${startTime}`);
		const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

		if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
			return fail(400, { error: 'Invalid date or time' });
		}

		// Check if room exists
		const room = await getRoom(roomId);
		if (!room) {
			return fail(404, { error: 'Room not found' });
		}

		// Check availability
		const isAvailable = await checkAvailability(
			roomId,
			startDateTime.toISOString(),
			endDateTime.toISOString()
		);

		if (!isAvailable) {
			return fail(409, {
				error: 'Room is already booked for this time slot. Please choose a different time.'
			});
		}

		// Create booking
		try {
			await createBooking({
				room_id: roomId,
				company_id: companyId,
				title,
				start_time: startDateTime.toISOString(),
				end_time: endDateTime.toISOString()
			});

			return { success: true };
		} catch (error) {
			console.error('Booking error:', error);
			return fail(500, { error: 'Failed to create booking. Please try again.' });
		}
	}
};

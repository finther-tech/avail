import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { deleteBooking } from '$lib/db/queries';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const bookingId = data.get('booking_id') as string;
		const roomId = data.get('room_id') as string;

		if (!bookingId) {
			return fail(400, { error: 'Booking ID is required' });
		}

		try {
			await deleteBooking(bookingId);
			// Redirect back to room page
			if (roomId) {
				throw redirect(303, `/room/${roomId}`);
			}
			throw redirect(303, '/');
		} catch (error) {
			// Handle redirect errors
			if (error && typeof error === 'object' && 'status' in error) {
				throw error;
			}
			console.error('Cancel error:', error);
			return fail(500, { error: 'Failed to cancel booking. Please try again.' });
		}
	}
};

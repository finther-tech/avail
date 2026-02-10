import type { PageServerLoad } from './$types';
import { getAllRooms, getCurrentBooking, getNextBooking, getTodayBookingsCount } from '$lib/db/queries';

export const load: PageServerLoad = async () => {
	try {
		// Fetch all rooms
		const rooms = await getAllRooms();

		// Fetch status for each room
		const roomStatuses = await Promise.all(
			rooms.map(async (room) => {
				const currentBooking = await getCurrentBooking(room.id);
				const nextBooking = await getNextBooking(room.id);
				const todayCount = await getTodayBookingsCount(room.id);

				// Calculate minutes until free
				let minutesUntilFree = 0;
				if (currentBooking) {
					const endTime = new Date(currentBooking.end_time);
					const now = new Date();
					minutesUntilFree = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
				}

				return {
					roomId: room.id,
					roomName: room.name,
					currentMeeting: currentBooking ? {
						title: currentBooking.title,
						endTime: new Date(currentBooking.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
						isNow: true
					} : null,
					nextMeeting: nextBooking ? {
						title: nextBooking.title,
						startTime: new Date(nextBooking.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
					} : null,
					totalToday: todayCount,
					isAvailable: !currentBooking
				};
			})
		);

		return {
			rooms,
			todaySchedules: roomStatuses
		};
	} catch (error) {
		console.error('Error loading home page:', error);
		// Return empty arrays on error
		return {
			rooms: [],
			todaySchedules: []
		};
	}
};

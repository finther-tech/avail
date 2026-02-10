import type { PageServerLoad } from './$types';
import { getAllRooms, getTodayBookingsCount } from '$lib/db/queries';
import { supabase } from '$lib/db/supabase';

export const load: PageServerLoad = async () => {
	try {
		const rooms = await getAllRooms();

		// Get today's date range in UTC
		const now = new Date();
		const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
		const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();

		// Get this week's date range (Monday to Sunday)
		const dayOfWeek = now.getUTCDay();
		const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));
		const endOfWeek = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 7));
		const startOfWeekIso = startOfWeek.toISOString();
		const endOfWeekIso = endOfWeek.toISOString();

		// Fetch analytics data for each room
		const roomStats = await Promise.all(
			rooms.map(async (room) => {
				// Today's bookings
				const todayCount = await getTodayBookingsCount(room.id);

				// This week's bookings by company
				const { data: weekBookings } = await supabase
					.from('bookings')
					.select('company_id, companies(name)')
					.eq('room_id', room.id)
					.gte('start_time', startOfWeekIso)
					.lt('start_time', endOfWeekIso);

				// Count by company
				const companyCounts: Record<string, { name: string; count: number }> = {};
				weekBookings?.forEach((booking: any) => {
					const companyName = booking.companies?.name || 'Unknown';
					if (!companyCounts[companyName]) {
						companyCounts[companyName] = { name: companyName, count: 0 };
					}
					companyCounts[companyName].count++;
				});

				// Peak hours (today's bookings grouped by hour)
				const { data: todayBookings } = await supabase
					.from('bookings')
					.select('start_time')
					.eq('room_id', room.id)
					.gte('start_time', startOfDay)
					.lt('start_time', endOfDay);

				const hourlyCounts: Record<number, number> = {};
				todayBookings?.forEach((booking) => {
					const hour = new Date(booking.start_time).getUTCHours();
					hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
				});

				// Total bookings this week
				const weekCount = weekBookings?.length || 0;

				return {
					roomId: room.id,
					roomName: room.name,
					todayCount,
					weekCount,
					companyCounts: Object.values(companyCounts),
					hourlyCounts
				};
			})
		);

		// Overall stats
		const totalToday = roomStats.reduce((sum, stat) => sum + stat.todayCount, 0);
		const totalWeek = roomStats.reduce((sum, stat) => sum + stat.weekCount, 0);

		return {
			roomStats,
			totalToday,
			totalWeek,
			startOfWeek: startOfWeek.toISOString(),
			endOfWeek: endOfWeek.toISOString()
		};
	} catch (error) {
		console.error('Error loading analytics:', error);
		return {
			roomStats: [],
			totalToday: 0,
			totalWeek: 0,
			startOfWeek: new Date().toISOString(),
			endOfWeek: new Date().toISOString()
		};
	}
};

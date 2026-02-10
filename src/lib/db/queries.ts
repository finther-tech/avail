import { supabase, type Room, type Booking, type RoomWithStatus } from './supabase.js';

// Get all rooms
export async function getAllRooms(): Promise<Room[]> {
	const { data, error } = await supabase
		.from('rooms')
		.select('*')
		.order('name');

	if (error) throw error;
	return data || [];
}

// Get a single room by ID
export async function getRoom(id: string): Promise<Room | null> {
	const { data, error } = await supabase
		.from('rooms')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') return null; // Not found
		throw error;
	}
	return data;
}

// Get current booking for a room (happening now)
export async function getCurrentBooking(roomId: string): Promise<Booking | null> {
	const now = new Date().toISOString();

	const { data, error } = await supabase
		.from('bookings')
		.select('*')
		.eq('room_id', roomId)
		.lte('start_time', now)
		.gt('end_time', now)
		.order('start_time')
		.limit(1)
		.maybeSingle();

	if (error) throw error;
	return data;
}

// Get next booking for a room
export async function getNextBooking(roomId: string): Promise<Booking | null> {
	const now = new Date().toISOString();

	const { data, error } = await supabase
		.from('bookings')
		.select('*')
		.eq('room_id', roomId)
		.gt('start_time', now)
		.order('start_time')
		.limit(1)
		.maybeSingle();

	if (error) throw error;
	return data;
}

// Check if room is available for a time slot
export async function checkAvailability(
	roomId: string,
	startTime: string,
	endTime: string
): Promise<boolean> {
	// Check for any overlapping bookings
	// Overlap condition: existing booking starts before new booking ends AND ends after new booking starts
	const { data, error } = await supabase
		.from('bookings')
		.select('id')
		.eq('room_id', roomId)
		.lt('start_time', endTime)
		.gt('end_time', startTime);

	if (error) throw error;
	return !data || data.length === 0;
}

// Create a new booking
export async function createBooking(booking: {
	room_id: string;
	company_id: string;
	title: string;
	start_time: string;
	end_time: string;
}): Promise<Booking> {
	const { data, error } = await supabase
		.from('bookings')
		.insert({
			id: crypto.randomUUID(),
			...booking
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

// Get bookings for a room (for a specific date range)
export async function getRoomBookings(
	roomId: string,
	startDate?: string,
	endDate?: string
): Promise<Booking[]> {
	let query = supabase
		.from('bookings')
		.select('*')
		.eq('room_id', roomId)
		.order('start_time', { ascending: true });

	if (startDate) {
		query = query.gte('start_time', startDate);
	}
	if (endDate) {
		query = query.lte('start_time', endDate);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data || [];
}

// Get room with full status
export async function getRoomWithStatus(roomId: string): Promise<RoomWithStatus | null> {
	const room = await getRoom(roomId);
	if (!room) return null;

	const currentBooking = await getCurrentBooking(roomId);
	const nextBooking = await getNextBooking(roomId);

	let minutesUntilFree = 0;
	if (currentBooking) {
		const endTime = new Date(currentBooking.end_time);
		const now = new Date();
		minutesUntilFree = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
	}

	return {
		...room,
		is_available: !currentBooking,
		current_booking: currentBooking,
		next_booking: nextBooking,
		minutes_until_free: minutesUntilFree
	};
}

// Get all companies
export async function getAllCompanies(): Promise<Array<{ id: string; name: string }>> {
	const { data, error } = await supabase
		.from('companies')
		.select('id, name')
		.order('name');

	if (error) throw error;
	return data || [];
}

// Get today's bookings count for a room
export async function getTodayBookingsCount(roomId: string): Promise<number> {
	// Use UTC to avoid timezone issues
	const now = new Date();
	const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
	const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();

	const { data, error } = await supabase
		.from('bookings')
		.select('id')
		.eq('room_id', roomId)
		.gte('start_time', startOfDay)
		.lt('start_time', endOfDay);

	if (error) throw error;
	return data?.length || 0;
}

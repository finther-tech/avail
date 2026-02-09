import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Room {
	id: string;
	name: string;
	calendar_id: string | null;
	qr_code_url: string | null;
	created_at: string;
}

export interface Company {
	id: string;
	name: string;
	created_at: string;
}

export interface Booking {
	id: string;
	room_id: string;
	company_id: string;
	title: string;
	start_time: string;
	end_time: string;
	created_at: string;
}

export interface RoomWithStatus extends Room {
	is_available: boolean;
	current_booking: Booking | null;
	next_booking: Booking | null;
	minutes_until_free: number;
}

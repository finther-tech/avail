import type { PageServerLoad } from './$types';
import { getAllRooms } from '$lib/db/queries';

export const load: PageServerLoad = async () => {
	const rooms = await getAllRooms();
	return {
		rooms
	};
};

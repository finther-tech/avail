import type { Actions, PageServerLoad } from './$types';
import { getRoom } from '$lib/db/queries';
import { parseBookingIntent, askAvail } from '$lib/ai/zai';

export const load: PageServerLoad = async ({ params }) => {
	const room = await getRoom(params.id);

	if (!room) {
		throw new Error('Room not found');
	}

	return { room };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const roomId = params.id;
		const { question } = await request.json();

		if (!question || typeof question !== 'string') {
			return { answer: 'Please ask a question.' };
		}

		try {
			// Check if this is a booking intent
			const bookingKeywords = ['book', 'reserve', 'schedule', 'meeting'];
			const isBookingIntent = bookingKeywords.some(kw =>
				question.toLowerCase().includes(kw)
			);

			if (isBookingIntent) {
				// Try to parse as booking intent
				try {
					const intent = await parseBookingIntent(question, roomId);

					if (intent.confidence > 0.7) {
						// High confidence - provide booking link with pre-filled info
						const params = new URLSearchParams({
							date: intent.date,
							start_time: intent.start_time,
							duration: intent.duration_minutes.toString(),
							title: intent.title,
							...(intent.company && { company: intent.company })
						});

						return {
							answer: `I understood:\n\n` +
								`**Title:** ${intent.title}\n` +
								`**Date:** ${intent.date}\n` +
								`**Time:** ${intent.start_time}\n` +
								`**Duration:** ${intent.duration_minutes} minutes\n` +
								`**Company:** ${intent.company || 'Not specified'}\n\n` +
								`[Confirm Booking](/room/${roomId}/book?${params.toString()})`
						};
					} else {
						// Lower confidence - ask for clarification
						return {
							answer: `I think you want to book "${intent.title}" on ${intent.date} at ${intent.start_time} for ${intent.duration_minutes} minutes.\n\n` +
								`Could you please confirm:\n` +
								(intent.ambiguity.length > 0 ? intent.ambiguity.map(a => `- ${a}`).join('\n') : '') +
								`\n\nOr [book manually](/room/${roomId}/book)`
						};
					}
				} catch (parseError) {
					console.error('Parse error:', parseError);
					// Fall through to general Q&A
				}
			}

			// General Q&A about availability
			const answer = await askAvail(question, roomId);
			return { answer };

		} catch (error) {
			console.error('AI error:', error);
			return {
				answer: 'Sorry, I\'m having trouble connecting right now. Please try again or [book manually](/room/' + roomId + '/book).'
			};
		}
	}
};

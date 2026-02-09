import { env } from '$env/dynamic/private';

// Z.ai API integration
// Base URL: https://api.z.ai/api/paas/v4/
// Model: glm-4.7

export interface BookingIntent {
	title: string;
	date: string; // YYYY-MM-DD
	start_time: string; // HH:MM
	duration_minutes: number;
	company?: string;
	confidence: number;
	ambiguity: string[];
}

export interface ZaiMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface ZaiResponse {
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
	}>;
}

// Parse natural language booking request
export async function parseBookingIntent(
	text: string,
	roomId: string
): Promise<BookingIntent> {
	const apiKey = env.ZAI_API_KEY;
	const baseUrl = env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4/';
	const model = env.ZAI_MODEL || 'glm-4.7';

	const currentTime = new Date().toISOString();

	const messages: ZaiMessage[] = [
		{
			role: 'system',
			content: `You are a booking assistant for a meeting room system. Current time: ${currentTime}

Parse the user's booking request into JSON format.
Rooms available: alpha, bravo
Companies: finther, divfex

Return ONLY valid JSON with this exact structure:
{
  "title": "meeting title",
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "duration_minutes": number (15, 30, 45, 60, etc.),
  "company": "finther or divfex or null if not specified",
  "confidence": 0.0 to 1.0,
  "ambiguity": ["list of unclear details or empty array"]
}

Rules:
- Use "tomorrow", "today", etc. relative to current time
- Default to 30 minutes if duration not specified
- Default to 9:00 AM if time not specified for business hours
- If company is not mentioned, set to null
- Lower confidence if key details are missing`
		},
		{
			role: 'user',
			content: `Parse this booking request for room ${roomId}: "${text}"`
		}
	];

	const response = await fetch(`${baseUrl}chat/completions`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0.3
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Z.ai API error: ${response.status} - ${error}`);
	}

	const data: ZaiResponse = await response.json();
	const content = data.choices[0]?.message?.content || '{}';

	// Parse JSON response - might have markdown code blocks
	let jsonContent = content.trim();
	if (jsonContent.startsWith('```')) {
		jsonContent = jsonContent.replace(/```json\n?/, '').replace(/```\n?$/, '');
	}

	return JSON.parse(jsonContent) as BookingIntent;
}

// Explain booking conflict
export async function explainConflict(
	requestedStart: Date,
	requestedEnd: Date,
	conflictingBookings: Array<{
		title: string;
		start_time: string;
		end_time: string;
		company?: string;
	}>
): Promise<string> {
	const apiKey = env.ZAI_API_KEY;
	const baseUrl = env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4/';
	const model = env.ZAI_MODEL || 'glm-4.7';

	const conflictsList = conflictingBookings
		.map(b => `- "${b.title}" from ${new Date(b.start_time).toLocaleTimeString()} to ${new Date(b.end_time).toLocaleTimeString()}${b.company ? ` (${b.company})` : ''}`)
		.join('\n');

	const messages: ZaiMessage[] = [
		{
			role: 'system',
			content: 'You are a helpful assistant for a meeting room booking system. Explain conflicts clearly and suggest 3 alternative time slots. Be concise and friendly.'
		},
		{
			role: 'user',
			content: `Explain why this booking cannot be made:

Requested: ${requestedStart.toLocaleString()} to ${requestedEnd.toLocaleString()}

Conflicting bookings:
${conflictsList}

Be concise. Suggest 3 alternative time slots.`
		}
	];

	const response = await fetch(`${baseUrl}chat/completions`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0.7
		})
	});

	if (!response.ok) {
		// Return generic message on error
		const conflicts = conflictingBookings.map(b => b.title).join(', ');
		return `Room is already booked: ${conflicts}. Please choose a different time.`;
	}

	const data: ZaiResponse = await response.json();
	return data.choices[0]?.message?.content || 'Unable to process request.';
}

// General Q&A about availability
export async function askAvail(question: string, roomId?: string): Promise<string> {
	const apiKey = env.ZAI_API_KEY;
	const baseUrl = env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4/';
	const model = env.ZAI_MODEL || 'glm-4.7';

	const roomContext = roomId ? ` for room ${roomId}` : '';

	const messages: ZaiMessage[] = [
		{
			role: 'system',
			content: `You are Avail, a meeting room booking assistant. You help users check room availability and make bookings.
Rooms: alpha, bravo
Companies: finther, divfex

Be concise and helpful. If you need actual booking data, tell the user you need to check the system.`
		},
		{
			role: 'user',
			content: `Question${roomContext}: ${question}`
		}
	];

	console.log('Z.ai API call:', { baseUrl, model, hasApiKey: !!apiKey });

	const response = await fetch(`${baseUrl}chat/completions`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0.7
		})
	});

	console.log('Z.ai response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Z.ai API error:', response.status, errorText);
		return `API error: ${response.status} - ${errorText}`;
	}

	const data: ZaiResponse = await response.json();
	return data.choices[0]?.message?.content || 'Unable to process request.';
}

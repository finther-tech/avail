<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let isLoading = true;
	let error: string | null = null;
	// Use server-loaded data
	let room = data.room;
	let isAvailable = data.is_available;
	let currentBooking = data.current_booking;
	let nextBooking = data.next_booking;
	let minutesUntilFree = data.minutes_until_free;

	$: status = isAvailable ? 'FREE NOW' : 'BUSY';
	$: statusClass = isAvailable ? 'status-free' : 'status-busy';
</script>

<svelte:head>
	<title>{room?.name || 'Room'} - Avail</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/">← Back to Rooms</a>
	</header>

	<main>
		{#if error}
			<div class="error">
				<p>{error}</p>
				<a href="/">Return Home</a>
			</div>
		{:else}
			<div class="room-status">
				<h1>{room?.name}</h1>

				<div class="status-indicator {statusClass}">
					{status}
				</div>

				{#if !isAvailable && currentBooking}
					<div class="booking-info current">
						<p class="time">
							Booked until {new Date(currentBooking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</p>
						<p class="title">{currentBooking.title}</p>
						{#if minutesUntilFree > 0}
							<p class="free-in">
								Free in {minutesUntilFree} minute{minutesUntilFree !== 1 ? 's' : ''}
							</p>
						{/if}
					</div>
				{/if}

				{#if nextBooking}
					<div class="booking-info next">
						<p class="label">Next booking:</p>
						<p class="title">{nextBooking.title}</p>
						<p class="time">
							{new Date(nextBooking.start_time).toLocaleDateString()} at {new Date(nextBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</p>
					</div>
				{/if}

				{#if isAvailable}
					<div class="available-message">
						<p>✓ Room is available for booking</p>
					</div>
				{/if}

				<div class="actions">
					<a href="/room/{room?.id}/book" class="btn btn-primary">Book This Room</a>
					<a href="/room/{room?.id}/ask" class="btn btn-secondary">Ask Avail AI</a>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		margin: 0;
		padding: 0;
		background: #f8fafc;
		color: #0f172a;
	}

	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		margin-bottom: 2rem;
	}

	header a {
		text-decoration: none;
		color: #2563eb;
		font-weight: 500;
	}

	.room-status {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.status-indicator {
		padding: 1.5rem 2rem;
		border-radius: 12px;
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin-bottom: 2rem;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	.status-free {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
	}

	.status-busy {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		color: white;
	}

	.booking-info {
		background: #f8fafc;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.booking-info .title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.5rem 0;
	}

	.booking-info .time {
		color: #64748b;
		margin: 0;
	}

	.booking-info .label {
		color: #64748b;
		font-size: 0.875rem;
		margin: 0 0 0.5rem 0;
	}

	.booking-info.current .free-in {
		color: #22c55e;
		font-weight: 600;
		margin: 0.5rem 0 0 0;
	}

	.available-message {
		text-align: center;
		padding: 1.5rem;
		background: #f0fdf4;
		border-radius: 12px;
		margin-bottom: 1.5rem;
	}

	.available-message p {
		color: #16a34a;
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn {
		display: block;
		text-align: center;
		padding: 1rem 2rem;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: #f1f5f9;
		color: #0f172a;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
	}

	.error p {
		color: #dc2626;
		margin: 0 0 1rem 0;
	}

	.error a {
		color: #2563eb;
		text-decoration: none;
	}

	@media (max-width: 600px) {
		h1 {
			font-size: 1.5rem;
		}

		.status-indicator {
			font-size: 1.5rem;
			padding: 1rem 1.5rem;
		}
	}
</style>

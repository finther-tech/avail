<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { BRANDING, ASSETS } from '$lib/config/branding';

	export let data: PageData;

	let isLoading = true;
	let error: string | null = null;
	let room = data.room;
	let isAvailable = data.is_available;
	let currentBooking = data.current_booking;
	let nextBooking = data.next_booking;
	let minutesUntilFree = data.minutes_until_free;

	$: status = isAvailable ? 'Available' : 'Occupied';
	$: statusClass = isAvailable ? 'status-available' : 'status-occupied';

	function formatTime(date: string | Date): string {
		return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(date: string | Date): string {
		return new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>{room?.name || 'Room'} - {BRANDING.SYSTEM_NAME}</title>
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-back">Rooms</a>
			<span class="nav-divider">/</span>
			<span class="nav-current">{room?.name}</span>
		</div>
	</nav>

	<div class="main-wrapper">
		{#if error}
			<div class="error-container">
				<div class="error-card">
					<h2>Unable to load room</h2>
					<p>{error}</p>
					<a href="/" class="btn btn-primary">Return to Rooms</a>
				</div>
			</div>
		{:else}
			<div class="room-header">
				<div>
					<h1>{room?.name}</h1>
					<p class="room-subtitle">Meeting Room</p>
				</div>
				<div class="status-badge {statusClass}">
					<span class="status-dot"></span>
					<span class="status-text">{status}</span>
				</div>
			</div>

			<div class="content-grid">
				<div class="main-panel">
					<div class="panel-section">
						<h2 class="section-title">Current Status</h2>

						{#if !isAvailable && currentBooking}
							<div class="booking-card current-booking">
								<div class="booking-header">
									<span class="booking-label">Current Meeting</span>
									<span class="booking-time">
										until {formatTime(currentBooking.end_time)}
									</span>
								</div>
								<p class="booking-title">{currentBooking.title}</p>
								{#if minutesUntilFree !== null && minutesUntilFree > 0}
									<div class="time-remaining">
										Available in {minutesUntilFree} minute{minutesUntilFree !== 1 ? 's' : ''}
									</div>
								{/if}
							</div>
						{:else}
							<div class="available-card">
								<p class="available-text">Room is available for booking</p>
							</div>
						{/if}
					</div>

					{#if nextBooking}
						<div class="panel-section">
							<h2 class="section-title">Next Scheduled</h2>
							<div class="booking-card next-booking">
								<div class="booking-header">
									<span class="booking-label">Upcoming</span>
									<span class="booking-time">
										{formatDate(nextBooking.start_time)} at {formatTime(nextBooking.start_time)}
									</span>
								</div>
								<p class="booking-title">{nextBooking.title}</p>
							</div>
						</div>
					{/if}
				</div>

				<div class="action-panel">
					<div class="action-card">
						<h3>Quick Actions</h3>
						<div class="action-buttons">
							<a href="/room/{room?.id}/book" class="btn btn-primary">
								<span class="btn-label">Book This Room</span>
								<span class="btn-arrow">right</span>
							</a>
							<a href="/room/{room?.id}/ask" class="btn btn-secondary btn-with-logo">
								<img src={ASSETS.logoSvg} alt="" class="btn-logo" />
								<span class="btn-label">{BRANDING.APP_NAME}</span>
								<span class="btn-arrow">right</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:root {
		--primary: #1e40af;
		--primary-dark: #1e3a8a;
		--secondary: #64748b;
		--bg-page: #f8fafc;
		--bg-card: #ffffff;
		--text-primary: #0f172a;
		--text-secondary: #475569;
		--text-muted: #94a3b8;
		--border: #e2e8f0;
		--border-dark: #cbd5e1;
		--success: #059669;
		--success-bg: #f0fdf4;
		--success-border: #86efac;
		--occupied: #dc2626;
		--occupied-bg: #fef2f2;
		--occupied-border: #fca5a5;
		--radius: 6px;
		--radius-lg: 8px;
		--shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		--shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
	}

	* {
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		margin: 0;
		padding: 0;
		background: var(--bg-page);
		color: var(--text-primary);
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* Navigation */
	.navbar {
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
		padding: 0 0 0 0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.875rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.nav-back {
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.nav-back:hover {
		color: var(--primary);
	}

	.nav-divider {
		color: var(--text-muted);
	}

	.nav-current {
		color: var(--text-primary);
		font-weight: 500;
	}

	/* Main content */
	.main-wrapper {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		width: 100%;
	}

	/* Room header */
	.room-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		gap: 1.5rem;
	}

	.room-header h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.room-subtitle {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Status badge */
	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.status-badge.status-available {
		background: var(--success-bg);
		border: 1px solid var(--success-border);
		color: var(--success);
	}

	.status-badge.status-occupied {
		background: var(--occupied-bg);
		border: 1px solid var(--occupied-border);
		color: var(--occupied);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: currentColor;
	}

	/* Content grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 1.5rem;
		align-items: start;
	}

	/* Panels */
	.main-panel,
	.action-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.panel-section {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.section-title {
		font-size: 0.8125rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Booking cards */
	.booking-card {
		padding: 1.25rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
	}

	.current-booking {
		background: #fffbeb;
		border-color: #fde68a;
	}

	.next-booking {
		background: var(--bg-page);
	}

	.booking-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.booking-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.booking-time {
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	.booking-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.time-remaining {
		font-size: 0.875rem;
		color: var(--success);
		font-weight: 500;
	}

	/* Available card */
	.available-card {
		padding: 1.25rem;
		background: var(--success-bg);
		border: 1px solid var(--success-border);
		border-radius: var(--radius);
		text-align: center;
	}

	.available-text {
		font-size: 1rem;
		font-weight: 500;
		color: var(--success);
		margin: 0;
	}

	/* Action card */
	.action-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.action-card h3 {
		font-size: 0.8125rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Buttons */
	.btn {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-radius: var(--radius);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border: 1px solid var(--primary);
	}

	.btn-primary:hover {
		background: var(--primary-dark);
		border-color: var(--primary-dark);
	}

	.btn-secondary {
		background: var(--bg-card);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--bg-page);
		border-color: var(--border-dark);
	}

	.btn-arrow {
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.btn-with-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-logo {
		width: 18px;
		height: 18px;
	}

	/* Error state */
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}

	.error-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 2rem;
		text-align: center;
		max-width: 400px;
	}

	.error-card h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.error-card p {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		margin: 0 0 1.5rem 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
		}

		.room-header {
			flex-direction: column;
			align-items: stretch;
		}

		.status-badge {
			align-self: flex-start;
		}
	}
</style>

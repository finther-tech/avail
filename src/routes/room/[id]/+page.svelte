<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { BRANDING, ASSETS, COMPANY_COLORS } from '$lib/config/branding';

	export let data: PageData;

	let isLoading = true;
	let error: string | null = null;
	let room = data.room;
	let isAvailable = data.is_available;
	let currentBooking = data.current_booking;
	let nextBooking = data.next_booking;
	let minutesUntilFree = data.minutes_until_free;
	let weekBookings = data.weekBookings || [];
	let allBookings = data.allBookings || [];

	$: status = isAvailable ? 'Available' : 'Occupied';
	$: statusClass = isAvailable ? 'status-available' : 'status-occupied';

	function formatTime(date: string | Date): string {
		return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(date: string | Date): string {
		return new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function getCompanyBadgeClass(companyName: string | undefined): string {
		if (!companyName) return 'company-badge-none';
		const normalizedName = companyName.toLowerCase();
		if (normalizedName === 'finther') return 'company-badge-finther';
		if (normalizedName === 'dgb') return 'company-badge-dgb';
		return 'company-badge-none';
	}

	// Calendar helpers
	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

	function getWeekDates() {
		const now = new Date();
		const dayOfWeek = now.getDay();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
		startOfWeek.setHours(0, 0, 0, 0);

		return weekDays.map((_, index) => {
			const date = new Date(startOfWeek);
			date.setDate(startOfWeek.getDate() + index);
			return date;
		});
	}

	$: weekDates = getWeekDates();

	function getBookingForSlot(date: Date, hour: number) {
		if (!weekBookings || weekBookings.length === 0) return null;

		const slotStart = new Date(date);
		slotStart.setHours(hour, 0, 0, 0);
		const slotEnd = new Date(slotStart);
		slotEnd.setHours(hour + 1, 0, 0, 0);

		return weekBookings.find((booking: any) => {
			const bookingStart = new Date(booking.start_time);
			const bookingEnd = new Date(booking.end_time);
			return bookingStart < slotEnd && bookingEnd > slotStart;
		});
	}

	function getSlotClass(date: Date, hour: number): string {
		const booking = getBookingForSlot(date, hour);
		if (!booking) return 'slot-available';

		const companyName = booking.company_name?.toLowerCase() || '';
		if (companyName === 'finther') return 'slot-finther';
		if (companyName === 'dgb') return 'slot-dgb';
		return 'slot-booked';
	}

	function getBookingTitle(date: Date, hour: number): string {
		const booking = getBookingForSlot(date, hour);
		if (!booking) return '';
		return booking.title;
	}

	function formatHour(hour: number): string {
		if (hour === 12) return '12 PM';
		if (hour < 12) return `${hour} AM`;
		return `${hour - 12} PM`;
	}

	function formatDayDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function isPastSlot(date: Date, hour: number): boolean {
		const now = new Date();
		const slotStart = new Date(date);
		slotStart.setHours(hour, 0, 0, 0);
		return slotStart < now;
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
								{#if currentBooking.company_name}
									<span class="company-badge {getCompanyBadgeClass(currentBooking.company_name)}">
										{currentBooking.company_name}
									</span>
								{/if}
								{#if currentBooking.booked_by}
									<span class="booked-by">by {currentBooking.booked_by}</span>
								{/if}
								{#if minutesUntilFree !== null && minutesUntilFree > 0}
									<div class="time-remaining">
										Available in {minutesUntilFree} minute{minutesUntilFree !== 1 ? 's' : ''}
									</div>
								{/if}
								<form method="POST" action="/cancel" class="cancel-form-inline">
									<input type="hidden" name="booking_id" value={currentBooking.id} />
									<input type="hidden" name="room_id" value={room?.id} />
									<button type="submit" class="cancel-btn-inline" onclick={(e) => { if (!confirm('Cancel this booking?')) e.preventDefault(); }}>
										Cancel Booking
									</button>
								</form>
							</div>
						{:else}
							<div class="available-card">
								<p class="available-text">Room is available for booking</p>
							</div>
						{/if}
					</div>

					<!-- Weekly Calendar -->
					<div class="panel-section">
						<h2 class="section-title">This Week's Schedule</h2>
						<div class="calendar-container">
							<div class="calendar-header">
								<div class="calendar-spacer"></div>
								{#each weekDates as date}
									<div class="calendar-day-header">
										<span class="day-name">{weekDays[weekDates.indexOf(date)]}</span>
										<span class="day-date">{formatDayDate(date)}</span>
									</div>
								{/each}
							</div>
							{#each hours as hour}
								<div class="calendar-row">
									<div class="calendar-time">
										<span class="hour-label">{formatHour(hour)}</span>
									</div>
									{#each weekDates as date}
										{@const slotClass = getSlotClass(date, hour)}
										{@const bookingTitle = getBookingTitle(date, hour)}
										{@const isPast = isPastSlot(date, hour)}
										<div
											class="calendar-slot {slotClass} {isPast ? 'slot-past' : ''}"
											class:slot-available={!isPast && slotClass === 'slot-available'}
											title="{bookingTitle || (isPast ? 'Past' : 'Available')}"
										>
											{#if bookingTitle && !isPast}
												<span class="slot-title">{bookingTitle}</span>
											{/if}
										</div>
									{/each}
								</div>
							{/each}
							<div class="calendar-legend">
								<span class="legend-item">
									<span class="legend-box slot-available"></span>
									<span>Available</span>
								</span>
								<span class="legend-item">
									<span class="legend-box slot-finther"></span>
									<span>Finther</span>
								</span>
								<span class="legend-item">
									<span class="legend-box slot-dgb"></span>
									<span>DGB</span>
								</span>
							</div>
						</div>
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
								{#if nextBooking.company_name}
									<span class="company-badge {getCompanyBadgeClass(nextBooking.company_name)}">
										{nextBooking.company_name}
									</span>
								{/if}
								{#if nextBooking.booked_by}
									<span class="booked-by">by {nextBooking.booked_by}</span>
								{/if}
								<form method="POST" action="/cancel" class="cancel-form-inline">
									<input type="hidden" name="booking_id" value={nextBooking.id} />
									<input type="hidden" name="room_id" value={room?.id} />
									<button type="submit" class="cancel-btn-inline" onclick={(e) => { if (!confirm('Cancel this booking?')) e.preventDefault(); }}>
										Cancel Booking
									</button>
								</form>
							</div>
						</div>
					{/if}
					<!-- All Upcoming Bookings -->
					{#if allBookings.length > 0}
						<div class="panel-section">
							<h2 class="section-title">All Upcoming Bookings</h2>
							<div class="bookings-list">
								{#each allBookings as booking}
									<div class="booking-list-item">
										<div class="booking-list-info">
											<div class="booking-list-time">
												<span class="booking-date">{formatDate(booking.start_time)}</span>
												<span class="booking-time-range">
													{formatTime(booking.start_time)} - {formatTime(booking.end_time)}
												</span>
											</div>
											<div class="booking-list-details">
												<span class="booking-list-title">{booking.title}</span>
												{#if booking.company_name}
													<span class="company-badge-small {getCompanyBadgeClass(booking.company_name)}">
														{booking.company_name}
													</span>
												{/if}
												{#if booking.booked_by}
													<span class="booked-by-small">by {booking.booked_by}</span>
												{/if}
											</div>
										</div>
										<form method="POST" action="/cancel" class="cancel-form-small">
											<input type="hidden" name="booking_id" value={booking.id} />
											<input type="hidden" name="room_id" value={room?.id} />
											<button type="submit" class="cancel-btn-small" onclick={(e) => { if (!confirm('Cancel "' + booking.title + '"?')) e.preventDefault(); }}>
												Cancel
											</button>
										</form>
									</div>
								{/each}
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
								<span class="btn-arrow">→</span>
							</a>
							<a
								href="/room/{room?.id}/book?now=true"
								class="btn btn-accent"
							>
								<span class="btn-label">Book Now</span>
								<span class="btn-arrow">→</span>
							</a>
							<a href="/room/{room?.id}/ask" class="btn btn-secondary btn-with-logo">
								<img src={ASSETS.logoSvg} alt="" class="btn-logo" />
								<span class="btn-label">{BRANDING.APP_NAME}</span>
								<span class="btn-arrow">→</span>
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
		--error: #dc2626;
		--error-bg: #fef2f2;
		--error-border: #fca5a5;
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

	.cancel-form-inline {
		display: block;
		margin-top: 1rem;
	}

	.cancel-btn-inline {
		font-size: 0.8125rem;
		padding: 0.5rem 1rem;
		background: var(--error-bg);
		color: var(--error);
		border: 1px solid var(--error-border);
		border-radius: var(--radius);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.cancel-btn-inline:hover {
		background: #fee2e2;
	}

	/* Bookings list */
	.bookings-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.booking-list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-page);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		transition: all 0.15s ease;
	}

	.booking-list-item:hover {
		border-color: var(--border-dark);
	}

	.booking-list-info {
		flex: 1;
		min-width: 0;
	}

	.booking-list-time {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-bottom: 0.5rem;
	}

	.booking-date {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.booking-time-range {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.booking-list-details {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.booking-list-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.cancel-form-small {
		display: contents;
	}

	.cancel-btn-small {
		font-size: 0.75rem;
		padding: 0.375rem 0.75rem;
		background: var(--error-bg);
		color: var(--error);
		border: 1px solid var(--error-border);
		border-radius: var(--radius);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.cancel-btn-small:hover {
		background: #fee2e2;
	}

	/* Company badges */
	.company-badge {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.company-badge-finther {
		background: #f3e8ff;
		color: #9333ea;
	}

	.company-badge-dgb {
		background: #dbeafe;
		color: #2563eb;
	}

	.company-badge-small {
		display: inline-block;
		font-size: 0.6875rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.company-badge-small.company-badge-finther {
		background: #f3e8ff;
		color: #9333ea;
	}

	.company-badge-small.company-badge-dgb {
		background: #dbeafe;
		color: #2563eb;
	}

	.booked-by {
		display: inline-block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-left: 0.5rem;
		font-style: italic;
	}

	.booked-by-small {
		display: inline-block;
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
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

	.btn-accent {
		background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
		color: white;
		border: 1px solid transparent;
	}

	.btn-accent:hover {
		background: linear-gradient(135deg, #7e22ce 0%, #1d4ed8 100%);
		border-color: transparent;
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

	/* Weekly Calendar */
	.calendar-container {
		overflow-x: auto;
	}

	.calendar-header {
		display: grid;
		grid-template-columns: 60px repeat(5, 1fr);
		gap: 2px;
		margin-bottom: 0.5rem;
	}

	.calendar-spacer {
		padding-top: 0.5rem;
	}

	.calendar-day-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 0.25rem;
		background: var(--bg-page);
		border-radius: var(--radius);
	}

	.day-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.day-date {
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.calendar-row {
		display: grid;
		grid-template-columns: 60px repeat(5, 1fr);
		gap: 2px;
		margin-bottom: 2px;
	}

	.calendar-time {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hour-label {
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.calendar-slot {
		min-height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
		padding: 0.125rem;
		font-size: 0.6875rem;
		position: relative;
		transition: all 0.15s ease;
	}

	.slot-available {
		background: var(--success-bg);
		border: 1px solid var(--success-border);
		cursor: pointer;
	}

	.slot-available:hover {
		background: #d1fae5;
		border-color: #6ee7b7;
	}

	.slot-finther {
		background: #f3e8ff;
		border: 1px solid #d8b4fe;
		color: #7e22ce;
	}

	.slot-dgb {
		background: #dbeafe;
		border: 1px solid #93c5fd;
		color: #1d4ed8;
	}

	.slot-booked {
		background: #f1f5f9;
		border: 1px solid var(--border);
		color: var(--text-muted);
	}

	.slot-past {
		background: var(--bg-page);
		border: 1px solid var(--border);
		color: var(--text-muted);
		opacity: 0.5;
	}

	.slot-title {
		font-size: 0.625rem;
		font-weight: 500;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
		line-height: 1.2;
	}

	.calendar-legend {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		padding: 0.75rem;
		background: var(--bg-page);
		border-radius: var(--radius);
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.legend-box {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		flex-shrink: 0;
	}
</style>

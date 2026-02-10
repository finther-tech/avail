<script lang="ts">
	import type { PageData } from './$types';
	import { BRANDING, ROOM_CAROUSEL_IMAGES, ROOM_CONFIG, ASSETS } from '$lib/config/branding';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let currentDate = new Date();
	let carouselIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

	// Reactive state for each room's carousel index
	let carouselIndexes: Record<string, number> = $state({});

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric'
		});
	}

	function getRoomSchedule(roomId: string) {
		return data.todaySchedules?.find(s => s.roomId === roomId);
	}

	function getCarouselImages(roomId: string) {
		return ROOM_CAROUSEL_IMAGES[roomId as keyof typeof ROOM_CAROUSEL_IMAGES] || [];
	}

	function getCarouselIndex(roomId: string): number {
		return carouselIndexes[roomId] ?? 0;
	}

	function startCarousel(roomId: string) {
		const images = getCarouselImages(roomId);
		if (images.length <= 1) return;

		carouselIndexes = { ...carouselIndexes, [roomId]: 0 };

		const interval = setInterval(() => {
			const currentIndex = carouselIndexes[roomId] ?? 0;
			const nextIndex = (currentIndex + 1) % images.length;
			carouselIndexes = { ...carouselIndexes, [roomId]: nextIndex };
		}, 3000);

		carouselIntervals.set(roomId, interval);
	}

	function stopCarousel(roomId: string) {
		const interval = carouselIntervals.get(roomId);
		if (interval) {
			clearInterval(interval);
			carouselIntervals.delete(roomId);
		}
	}

	function nextImage(roomId: string, event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		const images = getCarouselImages(roomId);
		const currentIndex = carouselIndexes[roomId] ?? 0;
		const nextIndex = (currentIndex + 1) % images.length;
		carouselIndexes = { ...carouselIndexes, [roomId]: nextIndex };
	}

	function prevImage(roomId: string, event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		const images = getCarouselImages(roomId);
		const currentIndex = carouselIndexes[roomId] ?? 0;
		const prevIndex = (currentIndex - 1 + images.length) % images.length;
		carouselIndexes = { ...carouselIndexes, [roomId]: prevIndex };
	}

	onMount(() => {
		data.rooms?.forEach(room => {
			startCarousel(room.id);
		});
	});

	onDestroy(() => {
		carouselIntervals.forEach(interval => clearInterval(interval));
	});
</script>

<svelte:head>
	<title>{BRANDING.SYSTEM_FULL_NAME}</title>
	<meta name="description" content="Check availability and book meeting rooms" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<img src={ASSETS.logo} alt="{BRANDING.SYSTEM_NAME} logo" class="nav-logo" />
			<span class="nav-brand">{BRANDING.SYSTEM_NAME}</span>
		</div>
	</nav>

	<div class="main-wrapper">
		<header class="page-header">
			<div class="header-content">
				<div>
					<h1>Meeting Room Booking</h1>
					<p>Check availability and reserve meeting spaces</p>
				</div>
				<div class="date-display">
					<span class="date-label">Today</span>
					<span class="date-value">{formatDate(currentDate)}</span>
				</div>
			</div>
		</header>

		<!-- Today's Overview Dashboard -->
		<section class="dashboard-section">
			<h2 class="section-title">Today's Overview</h2>
			<div class="dashboard-grid">
				{#each data.todaySchedules as schedule}
					<a href="/room/{schedule.roomId}" class="dashboard-card">
						<div class="dashboard-card-header">
							<h3 class="room-name">{schedule.roomName}</h3>
							<span class="floor-badge">{ROOM_CONFIG.floor}</span>
						</div>

						<div class="status-section">
							{#if schedule.currentMeeting && schedule.currentMeeting.isNow}
								<div class="status-busy">
									<span class="status-indicator busy"></span>
									<span class="status-text">Occupied until {schedule.currentMeeting.endTime}</span>
								</div>
								<p class="current-meeting">{schedule.currentMeeting.title}</p>
							{:else}
								<div class="status-available">
									<span class="status-indicator available"></span>
									<span class="status-text">Available Now</span>
								</div>
							{/if}
						</div>

						{#if schedule.nextMeeting}
							<div class="next-meeting">
								<span class="next-label">Next:</span>
								<span class="next-info">{schedule.nextMeeting.startTime} - {schedule.nextMeeting.title}</span>
							</div>
						{/if}

						<div class="booking-summary">
							<div class="summary-item">
								<span class="summary-label">Bookings today</span>
								<span class="summary-value">{schedule.totalToday}</span>
							</div>
						</div>

						<div class="card-action">View Details</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- Room Cards with Image Carousel -->
		<section class="rooms-section">
			<h2 class="section-title">Rooms</h2>
			<div class="room-grid">
				{#each data.rooms as room}
					{@const schedule = getRoomSchedule(room.id)}
					{@const carouselImages = getCarouselImages(room.id)}
					{@const currentIndex = getCarouselIndex(room.id)}
					<a href="/room/{room.id}" class="room-card">
						<div class="room-carousel-container">
							<div class="carousel-slide">
								<img
									src={carouselImages[currentIndex] || carouselImages[0]}
									alt="{room.name}"
									class="room-image"
								/>
							</div>
							{#if carouselImages.length > 1}
								<button
									class="carousel-nav carousel-prev"
									onclick={(e) => prevImage(room.id, e)}
									type="button"
								>
									<span></span>
								</button>
								<button
									class="carousel-nav carousel-next"
									onclick={(e) => nextImage(room.id, e)}
									type="button"
								>
									<span></span>
								</button>
								<div class="carousel-dots">
									{#each carouselImages as _, index}
										<div class="carousel-dot {index === currentIndex ? 'active' : ''}"></div>
									{/each}
								</div>
							{/if}
						</div>
						<div class="room-details">
							<h3 class="room-name">{room.name}</h3>
							<div class="room-meta">
								<div class="meta-row">
									<span class="meta-label">Floor</span>
									<span class="meta-value">{ROOM_CONFIG.floor}</span>
								</div>
								<div class="meta-row">
									<span class="meta-label">Today</span>
									<span class="meta-value">
										{schedule?.totalToday || 0} bookings
									</span>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- Quick Actions -->
		<section class="actions-section">
			<h2 class="section-title">Quick Actions</h2>
			<div class="actions-grid">
				{#each data.rooms.slice(0, 1) as room}
					<a href="/room/{room.id}/ask" class="action-card">
						<img src={ASSETS.logoSvg} alt="" class="action-logo" />
						<div class="action-content">
							<h3>
								<img src={ASSETS.logoSvg} alt="" class="logo-inline" />
								Book with {BRANDING.APP_NAME}
							</h3>
							<p>Use natural language to book quickly</p>
						</div>
					</a>
					<a href="/room/{room.id}/book" class="action-card">
						<img src={ASSETS.logoSvg} alt="" class="action-logo" />
						<div class="action-content">
							<h3>Manual Booking</h3>
							<p>Fill out the booking form</p>
						</div>
					</a>
				{/each}
			</div>
		</section>
	</div>

	<footer class="app-footer">
		<div class="footer-content">
			<span>{BRANDING.SYSTEM_NAME} v{BRANDING.VERSION}</span>
			<span>{ROOM_CONFIG.floor}</span>
		</div>
	</footer>
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
		--occupied: #dc2626;
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
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.875rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.nav-logo {
		height: 28px;
		width: auto;
	}

	.nav-brand {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	/* Main content */
	.main-wrapper {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.5rem 1rem;
		width: 100%;
	}

	/* Page header */
	.page-header {
		margin-bottom: 1.5rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.page-header p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.date-display {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.date-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.date-value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	/* Sections */
	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Dashboard Section */
	.dashboard-section {
		margin-bottom: 2rem;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.dashboard-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.dashboard-card:hover {
		border-color: var(--border-dark);
		box-shadow: var(--shadow-lg);
	}

	.dashboard-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.dashboard-card-header .room-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.floor-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: var(--bg-page);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-secondary);
	}

	/* Status */
	.status-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.status-busy,
	.status-available {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.status-busy {
		color: var(--occupied);
	}

	.status-available {
		color: var(--success);
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.status-indicator.busy {
		background: var(--occupied);
	}

	.status-indicator.available {
		background: var(--success);
	}

	.current-meeting {
		font-size: 0.9375rem;
		color: var(--text-primary);
		margin: 0;
		font-weight: 500;
	}

	.next-meeting {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		padding: 0.5rem;
		background: var(--bg-page);
		border-radius: var(--radius);
	}

	.next-label {
		flex-shrink: 0;
		opacity: 0.7;
	}

	/* Booking summary */
	.booking-summary {
		display: flex;
		gap: 1rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.summary-label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.summary-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.card-action {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--primary);
		text-align: center;
		padding: 0.5rem;
		border-top: 1px solid var(--border);
		margin-top: auto;
	}

	/* Rooms Section */
	.rooms-section {
		margin-bottom: 2rem;
	}

	.room-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
	}

	.room-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		display: flex;
		flex-direction: column;
	}

	.room-card:hover {
		border-color: var(--border-dark);
		box-shadow: var(--shadow-lg);
	}

	/* Image Carousel */
	.room-carousel-container {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--bg-page);
		border-bottom: 1px solid var(--border);
	}

	.carousel-slide {
		width: 100%;
		height: 100%;
	}

	.room-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.carousel-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid var(--border);
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s ease;
		z-index: 2;
	}

	.carousel-nav:hover {
		background: white;
	}

	.carousel-nav span {
		display: block;
		width: 0;
		height: 0;
		border-left: 6px solid var(--text-secondary);
		border-top: 4px solid transparent;
		border-bottom: 4px solid transparent;
	}

	.carousel-prev {
		left: 0.5rem;
	}

	.carousel-prev span {
		transform: rotate(180deg);
	}

	.carousel-next {
		right: 0.5rem;
	}

	.carousel-dots {
		position: absolute;
		bottom: 0.75rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.375rem;
		z-index: 2;
	}

	.carousel-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		transition: background 0.15s ease;
	}

	.carousel-dot.active {
		background: white;
	}

	.room-details {
		padding: 1rem;
	}

	.room-details .room-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
	}

	.room-meta {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
	}

	.meta-label {
		color: var(--text-muted);
	}

	.meta-value {
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Actions Section */
	.actions-section {
		margin-bottom: 1rem;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.action-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.action-card:hover {
		border-color: var(--border-dark);
		box-shadow: var(--shadow-lg);
	}

	.action-logo {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
	}

	.action-content {
		flex: 1;
	}

	.action-card h3 {
		font-size: 0.9375rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-inline {
		width: 20px;
		height: 20px;
	}

	.action-card p {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Footer */
	.app-footer {
		background: var(--bg-card);
		border-top: 1px solid var(--border);
		padding: 0.875rem 1rem;
		margin-top: auto;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.main-wrapper {
			padding: 1rem 0.75rem;
		}

		.header-content {
			flex-direction: column;
		}

		.date-display {
			align-items: flex-start;
		}

		.page-header h1 {
			font-size: 1.25rem;
		}

		.dashboard-grid,
		.room-grid,
		.actions-grid {
			grid-template-columns: 1fr;
		}

		.room-carousel-container {
			height: 180px;
		}

		.action-card {
			flex-direction: column;
			text-align: center;
			padding: 1rem;
		}

		.action-card h3 {
			justify-content: center;
		}

		.footer-content {
			flex-direction: column;
			gap: 0.375rem;
		}
	}

	@media (min-width: 641px) and (max-width: 900px) {
		.dashboard-grid,
		.room-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>

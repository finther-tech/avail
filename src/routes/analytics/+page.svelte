<script lang="ts">
	import type { PageData } from './$types';
	import { BRANDING, COMPANY_COLORS } from '$lib/config/branding';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	function formatWeekRange(start: string, end: string): string {
		const startDate = new Date(start);
		const endDate = new Date(end);
		return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}

	function getHourLabel(hour: number): string {
		return `${hour.toString().padStart(2, '0')}:00`;
	}

	function getCompanyColor(companyName: string): string {
		const normalizedName = companyName.toLowerCase();
		if (normalizedName === 'finther') return COMPANY_COLORS.finther;
		if (normalizedName === 'dgb') return COMPANY_COLORS.dgb;
		return '#94a3b8';
	}

	function getCompanyBgColor(companyName: string): string {
		const normalizedName = companyName.toLowerCase();
		if (normalizedName === 'finther') return '#f3e8ff';
		if (normalizedName === 'dgb') return '#dbeafe';
		return '#f1f5f9';
	}

	function getMaxHourlyCount(): number {
		let max = 0;
		data.roomStats.forEach((stat) => {
			Object.values(stat.hourlyCounts).forEach((count) => {
				if (count > max) max = count;
			});
		});
		return max || 1;
	}

	const maxHourlyCount = $derived(getMaxHourlyCount());
</script>

<svelte:head>
	<title>Analytics - {BRANDING.SYSTEM_NAME}</title>
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-back">Back</a>
			<span class="nav-divider">/</span>
			<span class="nav-current">Analytics</span>
		</div>
	</nav>

	<div class="main-wrapper">
		<div class="page-header">
			<h1>Analytics</h1>
			<p>Room usage insights and booking statistics</p>
		</div>

		<!-- Overall Stats -->
		<section class="stats-section">
			<h2 class="section-title">Overview</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<span class="stat-label">Today</span>
					<span class="stat-value">{data.totalToday}</span>
					<span class="stat-sub">bookings</span>
				</div>
				<div class="stat-card">
					<span class="stat-label">This Week</span>
					<span class="stat-value">{data.totalWeek}</span>
					<span class="stat-sub">{formatWeekRange(data.startOfWeek, data.endOfWeek)}</span>
				</div>
			</div>
		</section>

		<!-- Room Stats -->
		<section class="room-stats-section">
			<h2 class="section-title">Room Usage</h2>
			<div class="room-stats-grid">
				{#each data.roomStats as stat}
					<div class="room-stat-card">
						<div class="room-stat-header">
							<h3 class="room-stat-name">{stat.roomName}</h3>
							<div class="room-stat-badge">
								<span class="room-stat-count">{stat.todayCount}</span>
								<span class="room-stat-label">today</span>
							</div>
						</div>

						<!-- This week's bookings -->
						<div class="week-bookings">
							<span class="week-bookings-label">This week: {stat.weekCount} bookings</span>
						</div>

						<!-- Company breakdown -->
						{#if stat.companyCounts.length > 0}
							<div class="company-breakdown">
								<span class="breakdown-label">By company:</span>
								<div class="company-bars">
									{#each stat.companyCounts as company}
										<div class="company-bar-item">
											<div class="company-bar-info">
												<span class="company-name">{company.name}</span>
												<span class="company-count">{company.count}</span>
											</div>
											<div class="company-bar-track">
												<div
													class="company-bar-fill"
													style="background-color: {getCompanyColor(company.name)}; width: {(company.count / Math.max(...stat.companyCounts.map(c => c.count))) * 100}%"
												></div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="no-bookings">No bookings this week</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Peak Hours -->
		<section class="peak-hours-section">
			<h2 class="section-title">Today's Peak Hours</h2>
			<div class="peak-hours-grid">
				{#each data.roomStats as stat}
					<div class="peak-hours-card">
						<h3 class="peak-hours-title">{stat.roomName}</h3>
						{#if Object.keys(stat.hourlyCounts).length > 0}
							<div class="hours-chart">
								{#each Array.from({ length: 12 }, (_, i) => i + 8) as hour}
									{@const count = stat.hourlyCounts[hour] || 0}
									<div class="hour-bar" style="height: {count > 0 ? (count / maxHourlyCount) * 100 : 5}%">
										<span class="hour-count">{count || ''}</span>
										<span class="hour-label">{getHourLabel(hour)}</span>
									</div>
								{/each}
							</div>
						{:else}
							<div class="no-bookings">No bookings today</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Company Comparison -->
		<section class="company-compare-section">
			<h2 class="section-title">Company Usage This Week</h2>
			<div class="company-compare-card">
				{#each ['Finther', 'DGB'] as company}
					{@const totalCompanyBookings = data.roomStats.reduce((sum, stat) => {
						const companyStat = stat.companyCounts.find(c => c.name.toLowerCase() === company.toLowerCase());
						return sum + (companyStat?.count || 0);
					}, 0)}
					<div class="company-compare-item">
						<div class="company-compare-header">
							<span
								class="company-compare-badge"
								style="background-color: {getCompanyBgColor(company)}; color: {getCompanyColor(company)}"
							>
								{company}
							</span>
							<span class="company-compare-count">{totalCompanyBookings} bookings</span>
						</div>
						<div class="company-compare-bar">
							<div
								class="company-compare-fill"
								style="background-color: {getCompanyColor(company)}; width: {data.totalWeek > 0 ? (totalCompanyBookings / data.totalWeek) * 100 : 0}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</section>
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

	/* Page header */
	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.page-header p {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		margin: 0;
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

	.stats-section,
	.room-stats-section,
	.peak-hours-section,
	.company-compare-section {
		margin-bottom: 2rem;
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 0.875rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-sub {
		display: block;
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	/* Room stats grid */
	.room-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.room-stat-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.room-stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.room-stat-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.room-stat-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--bg-page);
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
	}

	.room-stat-count {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--primary);
		line-height: 1;
	}

	.room-stat-label {
		font-size: 0.6875rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.week-bookings {
		padding: 0.5rem 0.75rem;
		background: var(--success-bg);
		border-radius: var(--radius);
		margin-bottom: 1rem;
	}

	.week-bookings-label {
		font-size: 0.8125rem;
		color: var(--success);
		font-weight: 500;
	}

	/* Company breakdown */
	.company-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.breakdown-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.company-bars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.company-bar-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.company-bar-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
	}

	.company-name {
		color: var(--text-primary);
		font-weight: 500;
	}

	.company-count {
		color: var(--text-secondary);
	}

	.company-bar-track {
		height: 6px;
		background: var(--bg-page);
		border-radius: 3px;
		overflow: hidden;
	}

	.company-bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.no-bookings {
		font-size: 0.8125rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem;
		background: var(--bg-page);
		border-radius: var(--radius);
	}

	/* Peak hours */
	.peak-hours-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.peak-hours-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.peak-hours-title {
		font-size: 0.9375rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
	}

	.hours-chart {
		display: flex;
		align-items: flex-end;
		gap: 0.25rem;
		height: 100px;
	}

	.hour-bar {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		min-height: 5px;
		position: relative;
	}

	.hour-bar::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: var(--primary);
		border-radius: 3px 3px 0 0;
		opacity: 0.8;
	}

	.hour-count {
		position: relative;
		z-index: 1;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.hour-label {
		position: relative;
		z-index: 1;
		font-size: 0.625rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
		transform: rotate(-45deg);
		transform-origin: center top;
		white-space: nowrap;
	}

	/* Company comparison */
	.company-compare-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.company-compare-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.company-compare-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.company-compare-badge {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.company-compare-count {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.company-compare-bar {
		height: 8px;
		background: var(--bg-page);
		border-radius: 4px;
		overflow: hidden;
	}

	.company-compare-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.main-wrapper {
			padding: 1rem 0.75rem;
		}

		.page-header h1 {
			font-size: 1.25rem;
		}

		.stats-grid,
		.room-stats-grid,
		.peak-hours-grid {
			grid-template-columns: 1fr;
		}

		.hours-chart {
			height: 80px;
		}

		.hour-label {
			font-size: 0.5625rem;
		}
	}
</style>

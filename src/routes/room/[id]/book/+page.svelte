<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { BRANDING, COMPANIES, ROOM_CONFIG, ASSETS } from '$lib/config/branding';

	export let data: PageData;
	export let form: ActionData;

	// Form state
	let date = '';
	let startTime = '';
	let duration = 30;
	let title = '';
	let company: 'finther' | 'dgb' = 'finther';

	// Set default date to today
	$: {
		if (!date) {
			date = new Date().toISOString().split('T')[0];
		}
	}

	// Calculate end time display
	$: endTime = startTime && duration
		? (() => {
				const [hours, minutes] = startTime.split(':').map(Number);
				const end = new Date();
				end.setHours(hours, minutes + duration);
				return end.toTimeString().slice(0, 5);
			})()
		: '';

	// Duration options
	const durations = [15, 30, 45, 60, 90, 120];

	// Form validation
	$: isFormValid = date && startTime && title && duration;
</script>

<svelte:head>
	<title>Book {data.room.name} - {BRANDING.SYSTEM_NAME}</title>
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-back">Rooms</a>
			<span class="nav-divider">/</span>
			<a href="/room/{data.room.id}" class="nav-link">{data.room.name}</a>
			<span class="nav-divider">/</span>
			<span class="nav-current">Book</span>
		</div>
	</nav>

	<div class="main-wrapper">
		<div class="page-header">
			<h1>Book {data.room.name}</h1>
			<p>Complete the form below to reserve this room</p>
		</div>

		<div class="content-layout">
			<div class="form-section">
				{#if form?.success}
					<div class="alert alert-success">
						<div class="alert-content">
							<h3>Booking Confirmed</h3>
							<p>Your reservation has been created successfully.</p>
						</div>
						<a href="/room/{data.room.id}" class="alert-action">View Room Status</a>
					</div>
				{/if}

				{#if form?.error}
					<div class="alert alert-error">
						<div class="alert-content">
							<h3>Booking Failed</h3>
							<p>{form.error}</p>
						</div>
					</div>
				{/if}

				<form method="POST" use:enhance class="booking-form">
					<div class="form-grid">
						<div class="form-field">
							<label for="date" class="field-label">
								Date
								<span class="required">*</span>
							</label>
							<input
								type="date"
								id="date"
								name="date"
								bind:value={date}
								required
								min={new Date().toISOString().split('T')[0]}
								class="field-input"
							/>
						</div>

						<div class="form-field">
							<label for="start_time" class="field-label">
								Start Time
								<span class="required">*</span>
							</label>
							<input
								type="time"
								id="start_time"
								name="start_time"
								bind:value={startTime}
								required
								class="field-input"
							/>
						</div>
					</div>

					<div class="form-field">
						<label for="duration" class="field-label">
							Duration
							<span class="required">*</span>
						</label>
						<select id="duration" name="duration" bind:value={duration} required class="field-input">
							{#each durations as d}
								<option value={d}>{d} minutes</option>
							{/each}
						</select>
					</div>

					{#if endTime}
						<div class="end-time-display">
							<span class="end-time-label">End time:</span>
							<span class="end-time-value">{endTime}</span>
						</div>
					{/if}

					<div class="form-field">
						<label for="title" class="field-label">
							Meeting Title
							<span class="required">*</span>
						</label>
						<input
							type="text"
							id="title"
							name="title"
							bind:value={title}
							placeholder="e.g., Team Standup, Client Meeting"
							required
							maxlength="100"
							class="field-input"
						/>
						<span class="field-hint">Maximum 100 characters</span>
					</div>

					<div class="form-field">
						<label for="company" class="field-label">
							Company
							<span class="required">*</span>
						</label>
						<select id="company" name="company" bind:value={company} required class="field-input">
							{#each COMPANIES as c}
								<option value={c.value}>{c.label}</option>
							{/each}
						</select>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn btn-primary" disabled={!isFormValid}>
							Confirm Booking
						</button>
						<a href="/room/{data.room.id}" class="btn btn-secondary">
							Cancel
						</a>
					</div>
				</form>
			</div>

			<div class="sidebar">
				<div class="sidebar-card">
					<h3>Alternative Booking</h3>
					<p>Use natural language to book quickly.</p>
					<a href="/room/{data.room.id}/ask" class="sidebar-link sidebar-link-with-logo">
						<img src={ASSETS.logoSvg} alt="" class="link-logo" />
						Use {BRANDING.APP_NAME}
						<span class="link-arrow">right</span>
					</a>
				</div>

				<div class="sidebar-card">
					<h3>Room Information</h3>
					<dl class="room-info">
						<div class="info-row">
							<dt>Room</dt>
							<dd>{data.room.name}</dd>
						</div>
						<div class="info-row">
							<dt>Capacity</dt>
							<dd>{data.room.id === 'alpha' ? ROOM_CONFIG.alpha.capacity : ROOM_CONFIG.bravo.capacity} persons</dd>
						</div>
						<div class="info-row">
							<dt>Floor</dt>
							<dd>{ROOM_CONFIG.floor}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
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
		--error: #dc2626;
		--error-bg: #fef2f2;
		--error-border: #fca5a5;
		--radius: 6px;
		--radius-lg: 8px;
		--shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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

	.nav-back,
	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.nav-back:hover,
	.nav-link:hover {
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

	/* Content layout */
	.content-layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1.5rem;
		align-items: start;
	}

	/* Form section */
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Alerts */
	.alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: var(--radius-lg);
	}

	.alert-success {
		background: var(--success-bg);
		border: 1px solid var(--success-border);
	}

	.alert-error {
		background: var(--error-bg);
		border: 1px solid var(--error-border);
	}

	.alert-content h3 {
		font-size: 0.9375rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
	}

	.alert-content p {
		font-size: 0.875rem;
		margin: 0;
		color: var(--text-secondary);
	}

	.alert-action {
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--primary);
		white-space: nowrap;
	}

	.alert-action:hover {
		text-decoration: underline;
	}

	/* Booking form */
	.booking-form {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-field {
		margin-bottom: 1.25rem;
	}

	.field-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.required {
		color: var(--error);
		margin-left: 2px;
	}

	.field-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.9375rem;
		font-family: inherit;
		transition: border-color 0.15s ease;
		background: var(--bg-card);
	}

	.field-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
	}

	.field-hint {
		display: block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.375rem;
	}

	.end-time-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--bg-page);
		border-radius: var(--radius);
		margin-bottom: 1.25rem;
	}

	.end-time-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.end-time-value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	/* Form actions */
	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius);
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		text-align: center;
		transition: all 0.15s ease;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
		flex: 1;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-dark);
		border-color: var(--primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--bg-card);
		color: var(--text-primary);
		border-color: var(--border);
	}

	.btn-secondary:hover {
		background: var(--bg-page);
		border-color: var(--border-dark);
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.sidebar-card h3 {
		font-size: 0.8125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sidebar-card > p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
	}

	.sidebar-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1rem;
		background: var(--bg-page);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.sidebar-link:hover {
		background: var(--bg-card);
		border-color: var(--border-dark);
	}

	.link-arrow {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.sidebar-link-with-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.link-logo {
		width: 18px;
		height: 18px;
	}

	/* Room info */
	.room-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.info-row:first-child {
		border-top: none;
		padding-top: 0;
	}

	.info-row dt {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.info-row dd {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.content-layout {
			grid-template-columns: 1fr;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

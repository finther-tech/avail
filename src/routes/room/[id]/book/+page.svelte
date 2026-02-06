<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Form state
	let date = '';
	let startTime = '';
	let duration = 30;
	let title = '';
	let company = 'finther';

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

	// Companies
	const companies = [
		{ value: 'finther', label: 'Finther' },
		{ value: 'divfex', label: 'Divfex' }
	];

	// Duration options
	const durations = [15, 30, 45, 60, 90, 120];
</script>

<svelte:head>
	<title>Book {data.room.name} - Avail</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/room/{data.room.id}">← Back to {data.room.name}</a>
	</header>

	<main>
		<div class="booking-page">
			<h1>Book {data.room.name}</h1>

			{#if form?.success}
				<div class="success-banner">
					<p>✓ Booking created successfully!</p>
					<a href="/room/{data.room.id}">View Room Status</a>
				</div>
			{/if}

			{#if form?.error}
				<div class="error-banner">
					<p>✗ {form.error}</p>
				</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="form-group">
					<label for="date">
						<span class="label-text">Date</span>
						<input
							type="date"
							id="date"
							name="date"
							bind:value={date}
							required
							min={new Date().toISOString().split('T')[0]}
						/>
					</label>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="start_time">
							<span class="label-text">Start Time</span>
							<input
								type="time"
								id="start_time"
								name="start_time"
								bind:value={startTime}
								required
							/>
						</label>
					</div>

					<div class="form-group">
						<label for="duration">
							<span class="label-text">Duration</span>
							<select id="duration" name="duration" bind:value={duration} required>
								{#each durations as d}
									<option value={d}>{d} minutes</option>
								{/each}
								<option value={60}>1 hour</option>
								<option value={90}>1.5 hours</option>
								<option value={120}>2 hours</option>
							</select>
						</label>
					</div>
				</div>

				{#if endTime}
					<p class="end-time">
						Ends at {endTime}
					</p>
				{/if}

				<div class="form-group">
					<label for="title">
						<span class="label-text">Meeting Title</span>
						<input
							type="text"
							id="title"
							name="title"
							bind:value={title}
							placeholder="e.g., Team Standup, Client Meeting"
							required
							maxlength="100"
						/>
					</label>
				</div>

				<div class="form-group">
					<label for="company">
						<span class="label-text">Company</span>
						<select id="company" name="company" bind:value={company} required>
							{#each companies as c}
								<option value={c.value}>{c.label}</option>
							{/each}
						</select>
					</label>
				</div>

				<button type="submit" class="btn-submit" disabled={!date || !startTime || !title}>
					Confirm Booking
				</button>
			</form>

			<div class="ai-cta">
				<p>Or use natural language:</p>
				<a href="/room/{data.room.id}/ask" class="ai-link">
					<span class="ai-icon">✨</span>
					Try AI Assistant
				</a>
			</div>
		</div>
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
		max-width: 500px;
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

	.booking-page h1 {
		font-size: 1.75rem;
		margin: 0 0 1.5rem 0;
	}

	.success-banner,
	.error-banner {
		padding: 1rem 1.5rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.success-banner {
		background: #f0fdf4;
		border: 1px solid #86efac;
		color: #16a34a;
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
	}

	.success-banner a,
	.error-banner a {
		color: inherit;
		text-decoration: underline;
		font-weight: 500;
	}

	form {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	label {
		display: block;
	}

	.label-text {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	input[type="date"],
	input[type="time"],
	input[type="text"],
	select {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.end-time {
		color: #64748b;
		font-size: 0.875rem;
		margin-top: -0.5rem;
		margin-bottom: 1.25rem;
	}

	.btn-submit {
		width: 100%;
		padding: 1rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-submit:hover:not(:disabled) {
		background: #1d4ed8;
		transform: translateY(-1px);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ai-cta {
		margin-top: 2rem;
		text-align: center;
		padding: 1.5rem;
		background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
		border-radius: 12px;
	}

	.ai-cta p {
		margin: 0 0 1rem 0;
		color: #64748b;
	}

	.ai-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: white;
		color: #2563eb;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.ai-link:hover {
		background: #f0f9ff;
		transform: translateY(-1px);
	}

	.ai-icon {
		font-size: 1.25rem;
	}

	@media (max-width: 500px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>

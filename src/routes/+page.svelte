<script lang="ts">
	import { onMount } from 'svelte';

	let rooms: Array<{ id: string; name: string }> = [];

	onMount(async () => {
		// For now, static rooms - later fetch from Supabase
		rooms = [
			{ id: 'alpha', name: 'Alpha Room' },
			{ id: 'bravo', name: 'Bravo Room' }
		];
	});
</script>

<svelte:head>
	<title>Avail - Meeting Room Booking</title>
	<meta name="description" content="Check availability and book meeting rooms" />
</svelte:head>

<div class="container">
	<header>
		<h1>Avail</h1>
		<p>Meeting Room Availability & Booking</p>
	</header>

	<main>
		<section class="rooms">
			<h2>Select a Room</h2>
			<div class="room-grid">
				{#each rooms as room}
					<a href="/room/{room.id}" class="room-card">
						<div class="room-icon">📍</div>
						<h3>{room.name}</h3>
						<p>Check availability</p>
					</a>
				{/each}
			</div>
		</section>

		<section class="info">
			<h2>How it works</h2>
			<ol>
				<li>Check room availability instantly</li>
				<li>Book in under 30 seconds</li>
				<li>AI helps find available slots</li>
			</ol>
		</section>
	</main>

	<footer>
		<p>Avail v0.1.0 • Rooms: Alpha, Bravo</p>
	</footer>
</div>

<style>
	:root {
		--primary: #2563eb;
		--primary-hover: #1d4ed8;
		--bg: #ffffff;
		--bg-alt: #f8fafc;
		--text: #0f172a;
		--text-muted: #64748b;
		--border: #e2e8f0;
	}

	* {
		box-sizing: border-box;
	}

	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		margin: 0;
		padding: 0;
		background: var(--bg-alt);
		color: var(--text);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	header h1 {
		font-size: 3rem;
		margin: 0 0 0.5rem 0;
		color: var(--primary);
	}

	header p {
		font-size: 1.25rem;
		color: var(--text-muted);
		margin: 0;
	}

	main {
		flex: 1;
	}

	.rooms h2 {
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.room-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.room-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.room-card:hover {
		border-color: var(--primary);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
		transform: translateY(-2px);
	}

	.room-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.room-card h3 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
	}

	.room-card p {
		color: var(--text-muted);
		margin: 0;
	}

	.info {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
	}

	.info h2 {
		font-size: 1.25rem;
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.info ol {
		margin: 0;
		padding-left: 1.5rem;
	}

	.info li {
		margin-bottom: 0.5rem;
		color: var(--text-muted);
	}

	footer {
		text-align: center;
		padding-top: 2rem;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	@media (max-width: 600px) {
		header h1 {
			font-size: 2rem;
		}

		.room-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

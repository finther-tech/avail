<script lang="ts">
	import type { PageData } from './$types';
	import { BRANDING, ASSETS } from '$lib/config/branding';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Select Room - {BRANDING.SYSTEM_NAME}</title>
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-back">Back</a>
			<span class="nav-divider">/</span>
			<span class="nav-current">Book a Room</span>
		</div>
	</nav>

	<div class="main-wrapper">
		<div class="page-header">
			<h1>Select a Room</h1>
			<p>Choose which room you'd like to book</p>
		</div>

		<div class="room-grid">
			{#each data.rooms as room}
				<a href="/room/{room.id}/book" class="room-card">
					<div class="room-card-header">
						<h2 class="room-name">{room.name}</h2>
						<span class="room-arrow">→</span>
					</div>
					<div class="room-card-body">
						<p class="room-description">Book this room for your meeting</p>
					</div>
				</a>
			{/each}
		</div>

		<div class="alternative-section">
			<p>Or use</p>
			<a href="/room/{data.rooms[0]?.id}/ask" class="ai-link">
				<img src={ASSETS.logoSvg} alt="" class="ai-logo" />
				{BRANDING.APP_NAME}
			</a>
			<p>to book with natural language</p>
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
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		width: 100%;
	}

	/* Page header */
	.page-header {
		margin-bottom: 2rem;
		text-align: center;
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

	/* Room grid */
	.room-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.room-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
		overflow: hidden;
	}

	.room-card:hover {
		border-color: var(--border-dark);
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	.room-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem;
		border-bottom: 1px solid var(--border);
		background: linear-gradient(to right, var(--bg-page), transparent);
	}

	.room-name {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.room-arrow {
		font-size: 1.5rem;
		color: var(--primary);
		transition: transform 0.15s ease;
	}

	.room-card:hover .room-arrow {
		transform: translateX(4px);
	}

	.room-card-body {
		padding: 1.25rem;
	}

	.room-description {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Alternative section */
	.alternative-section {
		text-align: center;
		padding: 1.5rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.alternative-section p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0.5rem 0;
	}

	.ai-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
		color: white;
		text-decoration: none;
		border-radius: var(--radius);
		font-weight: 500;
		font-size: 0.9375rem;
		transition: opacity 0.15s ease;
	}

	.ai-link:hover {
		opacity: 0.9;
	}

	.ai-logo {
		width: 20px;
		height: 20px;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.main-wrapper {
			padding: 1rem 0.75rem;
		}

		.page-header h1 {
			font-size: 1.25rem;
		}

		.room-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<script lang="ts">
	import type { PageData } from './$types';
	import { BRANDING, ASSETS } from '$lib/config/branding';

	export let data: PageData;

	let userInput = '';
	let aiResponse = '';
	let isLoading = false;

	async function askAI() {
		if (!userInput.trim() || isLoading) return;

		isLoading = true;
		aiResponse = '';

		try {
			const response = await fetch(`/api/room/${data.room.id}/ask`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: userInput })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const result = await response.json();
			aiResponse = result.answer;
		} catch {
			aiResponse = 'Unable to process your request. Please try again or contact support.';
		} finally {
			isLoading = false;
		}
	}

	// Handle Enter key
	async function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			await askAI();
		}
	}

	// Quick suggestions
	const suggestions = [
		'Is this room free tomorrow morning?',
		'Book 1 hour tomorrow at 2pm for team sync',
		'When is the next available slot?'
	];
</script>

<svelte:head>
	<title>{BRANDING.APP_NAME} - {data.room.name}</title>
</svelte:head>

<div class="app-container">
	<nav class="navbar">
		<div class="nav-container">
			<a href="/" class="nav-back">Rooms</a>
			<span class="nav-divider">/</span>
			<a href="/room/{data.room.id}" class="nav-link">{data.room.name}</a>
			<span class="nav-divider">/</span>
			<span class="nav-current">{BRANDING.APP_NAME}</span>
		</div>
	</nav>

	<div class="main-wrapper">
		<div class="page-header">
			<h1>
				<img src={ASSETS.logoSvg} alt="" class="header-logo" />
				{BRANDING.APP_NAME}
			</h1>
			<p>Ask about availability or book using natural language</p>
		</div>

		<div class="content-layout">
			<div class="chat-section">
				<div class="chat-container">
					{#if aiResponse}
						<div class="message message-assistant">
							<div class="message-header">
								<span class="message-sender">{BRANDING.APP_NAME}</span>
							</div>
							<p class="message-text">{aiResponse}</p>
						</div>
					{/if}

					{#if userInput && isLoading}
						<div class="message message-user">
							<div class="message-header">
								<span class="message-sender">You</span>
							</div>
							<p class="message-text">{userInput}</p>
						</div>
						<div class="message message-assistant message-loading">
							<div class="message-header">
								<span class="message-sender">{BRANDING.APP_NAME}</span>
							</div>
							<div class="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					{/if}

					{#if !aiResponse && !isLoading}
						<div class="chat-placeholder">
							<p>Ask me anything about room availability or bookings</p>
						</div>
					{/if}
				</div>

				<div class="input-section">
					<div class="input-wrapper">
						<textarea
							bind:value={userInput}
							onkeydown={handleKeydown}
							placeholder="Type your question or booking request..."
							disabled={isLoading}
							rows="3"
							class="chat-input"
						></textarea>
						<button
							onclick={askAI}
							disabled={!userInput.trim() || isLoading}
							class="send-button"
							type="button"
						>
							{#if isLoading}
								<span class="loading-text">Processing</span>
							{:else}
								<span>Send</span>
							{/if}
						</button>
					</div>

					<div class="suggestions">
						<span class="suggestions-label">Try asking:</span>
						<div class="suggestion-chips">
							{#each suggestions as suggestion}
								<button
									onclick={() => userInput = suggestion}
									class="suggestion-chip"
									disabled={isLoading}
									type="button"
								>
									{suggestion}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="sidebar">
				<div class="sidebar-card">
					<h3>Manual Booking</h3>
					<p>Prefer to fill out a form?</p>
					<a href="/room/{data.room.id}/book" class="sidebar-link">
						Book Manually
						<span class="link-arrow">→</span>
					</a>
				</div>

				<div class="sidebar-card">
					<h3>Examples</h3>
					<ul class="example-list">
						<li>"Is the room free tomorrow at 10am?"</li>
						<li>"Book 2 hours for client meeting"</li>
						<li>"When can I book a 30-minute call?"</li>
					</ul>
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-logo {
		width: 28px;
		height: 28px;
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

	/* Chat section */
	.chat-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Chat container */
	.chat-container {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		min-height: 300px;
		max-height: 500px;
		overflow-y: auto;
	}

	.chat-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 250px;
		color: var(--text-muted);
	}

	.chat-placeholder p {
		font-size: 0.9375rem;
		margin: 0;
	}

	/* Messages */
	.message {
		margin-bottom: 1.25rem;
	}

	.message:last-child {
		margin-bottom: 0;
	}

	.message-header {
		margin-bottom: 0.5rem;
	}

	.message-sender {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.message-text {
		font-size: 0.9375rem;
		line-height: 1.6;
		margin: 0;
	}

	.message-user {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.message-user .message-header {
		align-self: flex-end;
	}

	.message-user .message-text {
		background: var(--primary);
		color: white;
		padding: 0.875rem 1.25rem;
		border-radius: var(--radius);
		max-width: 80%;
		text-align: left;
	}

	.message-assistant {
		display: flex;
		flex-direction: column;
	}

	.message-assistant .message-text {
		background: var(--bg-page);
		border: 1px solid var(--border);
		padding: 0.875rem 1.25rem;
		border-radius: var(--radius);
		max-width: 80%;
	}

	.message-loading .message-text {
		display: none;
	}

	/* Typing indicator */
	.typing-indicator {
		display: flex;
		gap: 0.375rem;
		padding: 0.875rem 1.25rem;
		background: var(--bg-page);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		width: fit-content;
	}

	.typing-indicator span {
		width: 8px;
		height: 8px;
		background: var(--text-muted);
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%, 60%, 100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		30% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Input section */
	.input-section {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.input-wrapper {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.chat-input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.9375rem;
		resize: none;
		background: var(--bg-page);
	}

	.chat-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
	}

	.send-button {
		padding: 0.75rem 1.5rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: var(--radius);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s ease;
		align-self: flex-end;
	}

	.send-button:hover:not(:disabled) {
		background: var(--primary-dark);
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading-text {
		display: inline-block;
	}

	/* Suggestions */
	.suggestions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.suggestions-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.suggestion-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.suggestion-chip {
		padding: 0.5rem 1rem;
		background: var(--bg-page);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.875rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
	}

	.suggestion-chip:hover:not(:disabled) {
		background: var(--bg-card);
		border-color: var(--border-dark);
		color: var(--text-primary);
	}

	.suggestion-chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

	/* Example list */
	.example-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.example-list li {
		font-size: 0.875rem;
		color: var(--text-secondary);
		padding-left: 1rem;
		position: relative;
	}

	.example-list li::before {
		content: '"';
		position: absolute;
		left: 0;
		color: var(--text-muted);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.content-layout {
			grid-template-columns: 1fr;
		}

		.input-wrapper {
			flex-direction: column;
		}

		.send-button {
			width: 100%;
		}
	}
</style>

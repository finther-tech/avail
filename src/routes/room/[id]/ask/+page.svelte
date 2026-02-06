<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let userInput = '';
	let aiResponse = '';
	let isLoading = false;

	async function askAI() {
		if (!userInput.trim() || isLoading) return;

		isLoading = true;
		aiResponse = '';

		try {
			const response = await fetch(`/room/${data.room.id}/ask`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: userInput })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const result = await response.json();
			aiResponse = result.answer;
		} catch (error) {
			aiResponse = 'Sorry, I\'m having trouble connecting right now. Please try again.';
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
	<title>Ask Avail AI - {data.room.name}</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/room/{data.room.id}">← Back to {data.room.name}</a>
	</header>

	<main>
		<div class="ai-page">
			<div class="ai-header">
				<div class="ai-icon">✨</div>
				<h1>Ask Avail</h1>
				<p>Ask about room availability or book using natural language</p>
			</div>

			<div class="chat-container">
				{#if aiResponse}
					<div class="message ai-message">
						<div class="message-content">
							{aiResponse}
						</div>
					</div>
				{/if}

				{#if userInput && isLoading}
					<div class="message user-message">
						<div class="message-content">
							{userInput}
						</div>
					</div>
					<div class="message ai-message loading">
						<div class="message-content">
							<span class="dots"><span class="dot">•</span><span class="dot">•</span><span class="dot">•</span></span>
						</div>
					</div>
				{/if}
			</div>

			<div class="input-section">
				<div class="input-container">
					<textarea
						bind:value={userInput}
						onkeydown={handleKeydown}
						placeholder="e.g., 'Book the room for 1 hour tomorrow at 2pm'"
						disabled={isLoading}
						rows="3"
					></textarea>
					<button
						onclick={askAI}
						disabled={!userInput.trim() || isLoading}
						class="send-button"
						type="button"
					>
						{#if isLoading}
							<span class="spinner">⟳</span>
						{:else}
							Send
						{/if}
					</button>
				</div>

				<div class="suggestions">
					<p class="suggestions-label">Try asking:</p>
					<div class="suggestion-buttons">
						{#each suggestions as suggestion}
							<button
								onclick={() => userInput = suggestion}
								class="suggestion-button"
								disabled={isLoading}
								type="button"
							>
								{suggestion}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="manual-booking">
				<p>Prefer to fill a form?</p>
				<a href="/room/{data.room.id}/book" class="manual-link">Book Manually</a>
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

	.ai-page {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.ai-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.ai-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.ai-header h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #2563eb;
	}

	.ai-header p {
		color: #64748b;
		margin: 0;
	}

	.chat-container {
		flex: 1;
		min-height: 200px;
		margin-bottom: 1rem;
	}

	.message {
		margin-bottom: 1rem;
		display: flex;
	}

	.user-message {
		justify-content: flex-end;
	}

	.message-content {
		max-width: 80%;
		padding: 1rem 1.5rem;
		border-radius: 16px;
		line-height: 1.5;
	}

	.ai-message .message-content {
		background: white;
		color: #0f172a;
		border-bottom-left-radius: 4px;
	}

	.user-message .message-content {
		background: #2563eb;
		color: white;
		border-bottom-right-radius: 4px;
	}

	.ai-message.loading .message-content {
		padding: 1rem 2rem;
	}

	.dots {
		display: flex;
		gap: 0.25rem;
	}

	.dot {
		animation: bounce 1.4s infinite ease-in-out both;
		font-size: 1.5rem;
		color: #64748b;
	}

	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }

	@keyframes bounce {
		0%, 80%, 100% { transform: scale(0); }
		40% { transform: scale(1); }
	}

	.input-section {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.input-container {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	textarea {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		resize: none;
	}

	textarea:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.send-button {
		padding: 0.75rem 1.5rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		align-self: flex-end;
	}

	.send-button:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinner {
		display: inline-block;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.suggestions {
		border-top: 1px solid #e2e8f0;
		padding-top: 1rem;
	}

	.suggestions-label {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 0.75rem 0;
	}

	.suggestion-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.suggestion-button {
		padding: 0.5rem 1rem;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.suggestion-button:hover:not(:disabled) {
		background: #e2e8f0;
		border-color: #cbd5e1;
	}

	.manual-booking {
		text-align: center;
		padding: 1rem;
	}

	.manual-booking p {
		color: #64748b;
		margin: 0 0 0.5rem 0;
	}

	.manual-link {
		color: #2563eb;
		text-decoration: none;
		font-weight: 500;
	}

	.manual-link:hover {
		text-decoration: underline;
	}
</style>

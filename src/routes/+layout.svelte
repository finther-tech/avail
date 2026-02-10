<script lang="ts">
	import { ASSETS } from '$lib/config/branding';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={ASSETS.favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

{@render children()}

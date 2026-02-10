<script lang="ts">
	import type { ActionData, PageData } from './$types';

	interface Props {
		form: ActionData;
	}
	let { form }: Props = $props();
</script>

{#if form?.error}
	<div style="padding: 1rem; background: #fef2f2; color: #dc2626; border-radius: 8px; margin: 1rem;">
		{form.error}
		<a href="/" style="display: inline-block; margin-top: 0.5rem; color: #dc2626;">← Back to Home</a>
	</div>
{:else}
	<meta http-equiv="refresh" content="0;url=/" />
{/if}

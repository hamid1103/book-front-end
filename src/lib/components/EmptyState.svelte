<script lang="ts">
    import type { Snippet } from 'svelte';

    // Dashed placeholder for empty lists. children is the explanation, action an optional link or button
    let { title, children, action }: { title: string; children: Snippet; action?: Snippet } =
        $props();
</script>

<div
    class="flex flex-col items-center rounded-lg border-2 border-dashed border-border-soft bg-surface px-4 py-16 text-center"
>
    <h2 class="font-display text-xl font-bold text-ink">{title}</h2>
    <p class="mt-1 max-w-md font-body text-ink-muted">{@render children()}</p>
    {#if action}
        <div class="mt-4">{@render action()}</div>
    {/if}
</div>

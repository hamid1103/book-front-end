<script lang="ts">
    import type {Snippet} from "svelte";

    // Dashed placeholder for empty lists. children is the explanation, action an optional link or button
    let {title, children, action}: {title: string, children: Snippet, action?: Snippet} = $props();
</script>

<div class="flex flex-col items-center text-center bg-surface border-2 border-dashed border-border-soft rounded-lg py-16 px-4">
    <h2 class="font-display text-xl text-ink font-bold">{title}</h2>
    <p class="text-ink-muted font-body mt-1 max-w-md">{@render children()}</p>
    {#if action}
        <div class="mt-4">{@render action()}</div>
    {/if}
</div>

<script lang="ts">
    import type { Snippet } from 'svelte';

    // Page title with a small label above it. children is shown on the right, e.g. "3 van 5 gelezen"
    let {
        eyebrow,
        title,
        subtitle,
        children
    }: {
        eyebrow: string;
        title: string;
        subtitle?: string;
        children?: Snippet;
    } = $props();
</script>

<div class="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
    <div class="min-w-0">
        <span class="font-mono text-sm text-accent">{eyebrow}</span>
        <h1 class="font-display text-2xl font-bold break-words text-ink md:text-3xl">{title}</h1>
        {#if subtitle}
            <p class="font-body text-sm text-ink-muted">{subtitle}</p>
        {/if}
    </div>
    {#if children}
        <span class="font-body text-ink-muted">{@render children()}</span>
    {/if}
</div>

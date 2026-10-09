<script lang="ts">
    import type {Snippet} from "svelte";

    // Page title with a small label above it. children is shown on the right, e.g. "3 van 5 gelezen"
    let {eyebrow, title, subtitle, children}: {
        eyebrow: string,
        title: string,
        subtitle?: string,
        children?: Snippet,
    } = $props();
</script>

<div class="flex flex-wrap items-end justify-between gap-2 mb-6 border-b border-border pb-4">
    <div class="min-w-0">
        <span class="text-accent font-mono text-sm">{eyebrow}</span>
        <h1 class="font-display text-ink text-2xl md:text-3xl font-bold break-words">{title}</h1>
        {#if subtitle}
            <p class="text-sm font-body text-ink-muted">{subtitle}</p>
        {/if}
    </div>
    {#if children}
        <span class="text-ink-muted font-body">{@render children()}</span>
    {/if}
</div>

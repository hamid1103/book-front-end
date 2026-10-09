<script lang="ts" module>
    export type BadgeVariant = 'tan' | 'sage' | 'outline' | 'solid';
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';

    // Small rounded label, used for book tags, reading status, roles and "Gekoppeld"
    let { variant = 'outline', children }: { variant?: BadgeVariant; children: Snippet } = $props();

    const styles: Record<BadgeVariant, string> = {
        tan: 'font-semibold bg-tan-bg text-tan-text',
        sage: 'font-semibold bg-sage-bg text-sage-text border border-sage-border',
        outline: 'border border-border-soft text-ink-muted',
        solid: 'font-semibold bg-sage-text text-white'
    };
</script>

<span class="rounded-full px-2 py-0.5 font-body text-xs {styles[variant]}"
    >{@render children()}</span
>

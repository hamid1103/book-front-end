<script lang="ts">
    // First/previous/next/last buttons with the "Resultaten X-Y van de Z" summary in the middle
    let {
        page,
        limit,
        total,
        onNavigate
    }: {
        page: number;
        limit: number;
        total: number;
        onNavigate: (page: number) => void;
    } = $props();

    let lastPage = $derived(Math.max(1, Math.ceil(total / limit)));
    let firstResult = $derived(total === 0 ? 0 : (page - 1) * limit + 1);
    let lastResult = $derived(Math.min(page * limit, total));

    let before = $derived([
        { label: '«', target: 1, disabled: page <= 1, title: 'Eerste pagina' },
        { label: '‹ Vorige', target: page - 1, disabled: page <= 1, title: 'Vorige pagina' }
    ]);
    let after = $derived([
        {
            label: 'Volgende ›',
            target: page + 1,
            disabled: page >= lastPage,
            title: 'Volgende pagina'
        },
        { label: '»', target: lastPage, disabled: page >= lastPage, title: 'Laatste pagina' }
    ]);
</script>

{#snippet buttons(list: typeof before)}
    {#each list as btn (btn.title)}
        <button
            type="button"
            title={btn.title}
            aria-label={btn.title}
            disabled={btn.disabled}
            class="cursor-pointer rounded-md border border-border-soft px-1.5 py-0.5 whitespace-nowrap text-ink-soft hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30 md:px-2 md:py-1"
            onclick={() => onNavigate(btn.target)}>{btn.label}</button
        >
    {/each}
{/snippet}

<!-- On narrow screens the summary gets its own row above the buttons, so nothing scrolls sideways (WCAG 1.4.10) -->
<nav
    aria-label="Paginering"
    class="sticky bottom-0 z-0 flex w-full flex-wrap items-center justify-between gap-1 rounded-md border-2 border-border bg-surface p-1 text-sm sm:h-10 sm:flex-nowrap sm:py-0 md:text-base"
>
    <div class="flex gap-1">{@render buttons(before)}</div>
    <span class="order-first w-full text-center font-display sm:order-none sm:w-auto"
        >Resultaten {firstResult}-{lastResult} van de {total}</span
    >
    <div class="flex gap-1">{@render buttons(after)}</div>
</nav>

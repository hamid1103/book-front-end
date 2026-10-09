<script lang="ts">
    // First/previous/next/last buttons with the "Resultaten X-Y van de Z" summary in the middle
    let {page, limit, total, onNavigate}: {
        page: number,
        limit: number,
        total: number,
        onNavigate: (page: number) => void,
    } = $props();

    let lastPage = $derived(Math.max(1, Math.ceil(total / limit)))
    let firstResult = $derived(total === 0 ? 0 : (page - 1) * limit + 1)
    let lastResult = $derived(Math.min(page * limit, total))

    let before = $derived([
        {label: '«', target: 1, disabled: page <= 1, title: 'Eerste pagina'},
        {label: '‹ Vorige', target: page - 1, disabled: page <= 1, title: 'Vorige pagina'},
    ])
    let after = $derived([
        {label: 'Volgende ›', target: page + 1, disabled: page >= lastPage, title: 'Volgende pagina'},
        {label: '»', target: lastPage, disabled: page >= lastPage, title: 'Laatste pagina'},
    ])
</script>

{#snippet buttons(list: typeof before)}
    {#each list as btn (btn.title)}
        <button
                type="button"
                title={btn.title}
                aria-label={btn.title}
                disabled={btn.disabled}
                class="rounded-md border border-border-soft px-1.5 md:px-2 py-0.5 md:py-1 whitespace-nowrap text-ink-soft hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                onclick={() => onNavigate(btn.target)}
        >{btn.label}</button>
    {/each}
{/snippet}

<nav aria-label="Paginering" class="w-full h-10 bg-surface flex justify-between items-center gap-1 px-1 text-sm md:text-base rounded-md border-border border-2 sticky bottom-0 z-0">
    <div class="flex gap-1">{@render buttons(before)}</div>
    <span class="font-display whitespace-nowrap">Resultaten {firstResult}-{lastResult} van de {total}</span>
    <div class="flex gap-1">{@render buttons(after)}</div>
</nav>

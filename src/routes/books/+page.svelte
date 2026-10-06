<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { untrack } from "svelte";
    import type {PageProps} from './$types';
    import BookCard from "$lib/components/BookCard.svelte";
    import {toggleReadingListEntry} from "$lib/readingList";
    let {data}: PageProps = $props();
    // $derived (not $state) so these update when load reruns after goto
    let meta = $derived(data.meta)
    let books = $derived(data.books)
    let readingList = $derived(data.readingList)
    let filters = $derived(data.filters)

    let activeFilterCount = $derived(
        (filters.q ? 1 : 0) + filters.level.length + filters.length.length + filters.tags.length
    )
    let firstResult = $derived(meta.total === 0 ? 0 : (meta.page-1) * meta.limit + 1)
    let lastResult = $derived(Math.min(meta.page * meta.limit, meta.total))

    // Opens when tags are chosen, but only the user closes it again, so deselecting the last tag keeps it open
    let tagsOpen = $state(untrack(() => data.filters.tags.length > 0))
    $effect.pre(() => {
        if (filters.tags.length > 0) tagsOpen = true;
    })

    const levels = ['2F', '3F', '3F+']
    // There's no length in the data, the server maps this onto the material type
    const lengths = [
        {value: 'Short', label: 'Kort', hint: 'artikelen, blogs'},
        {value: 'Medium', label: 'Middel', hint: 'tijdschriften, gedichten'},
        {value: 'Long', label: 'Lang', hint: 'boeken'},
    ]
    const pill = "cursor-pointer select-none rounded-full border-2 border-border-soft px-3 py-1 text-sm font-body text-ink-soft transition duration-150 hover:border-accent has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-1"

    // Checkboxes apply right away, the search field applies on Enter or the button
    function submitOnChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.type === 'checkbox') target.form?.requestSubmit();
    }

    let nextTarget = $derived(meta.page+1)
    let lastTarget = $derived(Math.ceil(meta.total / meta.limit))
    let previousTarget = $derived(meta.page-1)

    async function updateRLEntry(bookId: string, shouldDelete: boolean) {
        const result = await toggleReadingListEntry(bookId, shouldDelete);
        // Overrides the derived value until data.readingList changes again
        if (result) readingList = result.book;
    }

    function goToPage(TargetPage: number, limit: number = meta.limit)
    {
        let query = new URLSearchParams(page.url.searchParams);
        query.set('page', String(TargetPage));
        query.set('limit', String(limit));
        goto('?' + query.toString(), { noScroll: true, keepFocus: true });
    }
</script>
<div class="w-full h-full flex justify-center bg-ivory">
    <div class="w-full max-w-5xl h-fit items-center align-middle flex flex-col space-y-4 px-4 py-6 md:py-8">

        <!-- Plain GET form: works without JS, and SvelteKit turns it into a client-side navigation.
             Leaving `page` out means a new filter always starts at page 1 -->
        <form method="GET" action="/books" role="search" aria-label="Catalogus filteren"
              data-sveltekit-keepfocus data-sveltekit-noscroll
              onchange={submitOnChange}
              class="w-full bg-surface border-2 border-border rounded-lg p-3 md:p-4 flex flex-col gap-4">
            <input type="hidden" name="limit" value={meta.limit}/>

            <div class="flex gap-2">
                <label for="q" class="sr-only">Zoek op titel</label>
                <input id="q" name="q" type="search" value={filters.q} placeholder="Zoek op titel…"
                       class="flex-1 min-w-0 rounded-md border-2 border-border-soft bg-ivory px-3 py-1.5 font-body text-ink focus:border-accent focus:ring-accent"/>
                <button type="submit" class="rounded-md bg-accent px-4 py-1.5 font-body font-semibold text-white hover:bg-accent-hover cursor-pointer">Zoeken</button>
            </div>

            <div class="flex flex-col md:flex-row gap-4 md:gap-8">
                <fieldset class="flex flex-col gap-2">
                    <legend class="font-display font-bold text-ink mb-2">Niveau</legend>
                    <div class="flex flex-wrap gap-2">
                        {#each levels as level (level)}
                            <label class={pill}>
                                <input class="sr-only" type="checkbox" name="level" value={level} checked={filters.level.includes(level)}/>{level}
                            </label>
                        {/each}
                    </div>
                </fieldset>

                <fieldset class="flex flex-col gap-2">
                    <legend class="font-display font-bold text-ink mb-2">Lengte</legend>
                    <div class="flex flex-wrap gap-2">
                        {#each lengths as length (length.value)}
                            <label class={pill} title={length.hint}>
                                <input class="sr-only" type="checkbox" name="length" value={length.value} checked={filters.length.includes(length.value)}/>{length.label}
                                <span class="sr-only">({length.hint})</span>
                            </label>
                        {/each}
                    </div>
                </fieldset>
            </div>

            {#if data.tags.length > 0}
                <details class="group" bind:open={tagsOpen}>
                    <summary class="cursor-pointer font-display font-bold text-ink">
                        Thema's{#if filters.tags.length > 0}<span class="font-body font-normal text-ink-muted"> ({filters.tags.length} gekozen)</span>{/if}
                    </summary>
                    <fieldset class="mt-2">
                        <legend class="sr-only">Thema's</legend>
                        <div class="flex flex-wrap gap-2">
                            {#each data.tags as tag (tag)}
                                <label class={pill}>
                                    <input class="sr-only" type="checkbox" name="tags" value={tag} checked={filters.tags.includes(tag)}/>#{tag}
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                </details>
            {/if}

            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-body text-sm text-ink-muted">
                <p aria-live="polite">{meta.total} {meta.total === 1 ? 'resultaat' : 'resultaten'}</p>
                {#if activeFilterCount > 0}
                    <a href="/books?limit={meta.limit}" data-sveltekit-noscroll class="text-accent underline hover:text-accent-hover">Filters wissen ({activeFilterCount})</a>
                {/if}
            </div>
        </form>

        {#if books.length === 0}
            <div class="w-full bg-surface border-2 border-border rounded-lg p-6 text-center font-body text-ink-soft">
                <p class="font-display text-lg font-bold text-ink">Geen boeken gevonden</p>
                <p class="mt-1">Probeer minder of andere filters.</p>
            </div>
        {/if}

        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each books as book (book._id)}
                <BookCard {book}
                          inReadingList={readingList?.includes(book._id)}
                          onToggle={readingList ? () => updateRLEntry(book._id, readingList?.includes(book._id) ?? false) : undefined}/>
            {/each}
        </div>

        {#if meta.total > 0}
        <div class="w-full h-10 bg-surface flex justify-between items-center gap-1 px-1 text-sm md:text-base rounded-md border-border border-2 sticky bottom-0 z-0">

            {#each [
                {label: '«', target: 1, disabled: meta.page <= 1, title: 'First page'},
                {label: '‹ Prev', target: previousTarget, disabled: meta.page <= 1, title: 'Previous page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-1.5 md:px-2 py-0.5 md:py-1 whitespace-nowrap text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

            <span class="font-display whitespace-nowrap">Resultaten {firstResult}-{lastResult} van de {meta.total}</span>

            {#each [
                {label: 'Next ›', target: nextTarget, disabled: meta.page >= lastTarget, title: 'Next page'},
                {label: '»', target: lastTarget, disabled: meta.page >= lastTarget, title: 'Last page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-1.5 md:px-2 py-0.5 md:py-1 whitespace-nowrap text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

        </div>
        {/if}
    </div>
</div>
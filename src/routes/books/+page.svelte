<script lang="ts">
    import { page, navigating } from '$app/state';
    import { goto } from '$app/navigation';
    import { untrack } from 'svelte';
    import { SvelteURLSearchParams } from 'svelte/reactivity';
    import type { PageProps } from './$types';
    import BookCard from '$lib/components/BookCard.svelte';
    import BookCardSkeleton from '$lib/components/BookCardSkeleton.svelte';
    import ChoiceGroup, { type Choice } from '$lib/components/ChoiceGroup.svelte';
    import Pagination from '$lib/components/Pagination.svelte';
    import { toggleReadingListEntry } from '$lib/readingList';
    let { data }: PageProps = $props();
    // $derived (not $state) so these update when load reruns after goto
    let meta = $derived(data.meta);
    let books = $derived(data.books);
    let readingList = $derived(data.readingList);
    let filters = $derived(data.filters);

    let activeFilterCount = $derived(
        (filters.q ? 1 : 0) + filters.level.length + filters.length.length + filters.tags.length
    );

    // Opens when tags are chosen, but only the user closes it again, so deselecting the last tag keeps it open
    let tagsOpen = $state(untrack(() => data.filters.tags.length > 0));
    $effect.pre(() => {
        if (filters.tags.length > 0) tagsOpen = true;
    });

    const levels: Choice[] = ['2F', '3F', '3F+'].map((level) => ({ value: level, label: level }));
    // There's no length in the data, the server maps this onto the material type
    const lengths: Choice[] = [
        { value: 'Short', label: 'Kort', hint: 'artikelen, blogs' },
        { value: 'Medium', label: 'Middel', hint: 'tijdschriften, gedichten' },
        { value: 'Long', label: 'Lang', hint: 'boeken' }
    ];
    let tagChoices: Choice[] = $derived(data.tags.map((tag) => ({ value: tag, label: `#${tag}` })));

    // Checkboxes apply right away, the search field applies on Enter or the button
    function submitOnChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.type === 'checkbox') target.form?.requestSubmit();
    }

    async function updateRLEntry(bookId: string, shouldDelete: boolean) {
        const result = await toggleReadingListEntry(bookId, shouldDelete);
        // Overrides the derived value until data.readingList changes again
        if (result) readingList = result.book;
    }

    function goToPage(targetPage: number) {
        // Copy keeps repeated filters such as level=A&level=B
        const query = new SvelteURLSearchParams(page.url.searchParams);
        query.set('page', String(targetPage));
        query.set('limit', String(meta.limit));
        goto('?' + query.toString(), { noScroll: true, keepFocus: true });
    }
</script>

<div class="flex h-full w-full justify-center bg-ivory">
    <div
        class="flex h-fit w-full max-w-5xl flex-col items-center space-y-4 px-4 py-6 align-middle md:py-8"
    >
        <!-- Plain GET form: works without JS, and SvelteKit turns it into a client-side navigation.
             Leaving `page` out means a new filter always starts at page 1 -->
        <form
            method="GET"
            action="/books"
            role="search"
            aria-label="Catalogus filteren"
            data-sveltekit-keepfocus
            data-sveltekit-noscroll
            onchange={submitOnChange}
            class="flex w-full flex-col gap-4 rounded-lg border-2 border-border bg-surface p-3 md:p-4"
        >
            <input type="hidden" name="limit" value={meta.limit} />

            <div class="flex gap-2">
                <label for="q" class="sr-only">Zoek op titel</label>
                <input
                    id="q"
                    name="q"
                    type="search"
                    value={filters.q}
                    placeholder="Zoek op titel…"
                    class="min-w-0 flex-1 rounded-md border-2 border-border-soft bg-ivory px-3 py-1.5 font-body text-ink focus:border-accent focus:ring-accent"
                />
                <button
                    type="submit"
                    class="cursor-pointer rounded-md bg-accent px-4 py-1.5 font-body font-semibold text-white hover:bg-accent-hover"
                    >Zoeken</button
                >
            </div>

            <div class="flex flex-col gap-4 md:flex-row md:gap-8">
                <ChoiceGroup
                    legend="Niveau"
                    name="level"
                    type="checkbox"
                    options={levels}
                    value={filters.level}
                />
                <ChoiceGroup
                    legend="Lengte"
                    name="length"
                    type="checkbox"
                    options={lengths}
                    value={filters.length}
                />
            </div>

            {#if data.tags.length > 0}
                <details class="group" bind:open={tagsOpen}>
                    <summary class="cursor-pointer font-display font-bold text-ink">
                        Thema's{#if filters.tags.length > 0}<span
                                class="font-body font-normal text-ink-muted"
                            >
                                ({filters.tags.length} gekozen)</span
                            >{/if}
                    </summary>
                    <ChoiceGroup
                        class="mt-2"
                        legend="Thema's"
                        hideLegend
                        name="tags"
                        type="checkbox"
                        options={tagChoices}
                        value={filters.tags}
                    />
                </details>
            {/if}

            <div
                class="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-body text-sm text-ink-muted"
            >
                <p aria-live="polite">
                    {meta.total}
                    {meta.total === 1 ? 'resultaat' : 'resultaten'}
                </p>
                {#if activeFilterCount > 0}
                    <a
                        href="/books?limit={meta.limit}"
                        data-sveltekit-noscroll
                        class="text-accent underline hover:text-accent-hover"
                        >Filters wissen ({activeFilterCount})</a
                    >
                {/if}
            </div>
        </form>

        <!-- The results are server rendered (so they're in the HTML for search engines), the skeleton only
             shows during client-side navigation: filters, pagination, or coming here from another page -->
        {#if navigating.to?.route.id === '/books'}
            <p class="sr-only" role="status">Boeken laden…</p>
            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <BookCardSkeleton count={Math.min(meta.limit, 6)} />
            </div>
        {:else}
            {#if books.length === 0}
                <div
                    class="w-full rounded-lg border-2 border-border bg-surface p-6 text-center font-body text-ink-soft"
                >
                    <p class="font-display text-lg font-bold text-ink">Geen boeken gevonden</p>
                    <p class="mt-1">Probeer minder of andere filters.</p>
                </div>
            {/if}

            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {#each books as book (book._id)}
                    <BookCard
                        {book}
                        inReadingList={readingList?.includes(book._id)}
                        onToggle={readingList
                            ? () =>
                                  updateRLEntry(book._id, readingList?.includes(book._id) ?? false)
                            : undefined}
                    />
                {/each}
            </div>

            {#if meta.total > 0}
                <Pagination
                    page={meta.page}
                    limit={meta.limit}
                    total={meta.total}
                    onNavigate={goToPage}
                />
            {/if}
        {/if}
    </div>
</div>

<script lang="ts">
    import BookCard from '$lib/components/BookCard.svelte';
    import BookCardSkeleton from '$lib/components/BookCardSkeleton.svelte';
    import CallToAction from '$lib/components/CallToAction.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import { toggleReadingListEntry } from '$lib/readingList';

    const { data } = $props();

    let readingList = $derived(data.readingList);

    async function toggleBook(bookId: string) {
        const result = await toggleReadingListEntry(bookId, readingList?.includes(bookId) ?? false);
        // Overrides the derived value until data.readingList changes again
        if (result) readingList = result.book;
    }
</script>

<div class="flex h-full w-full flex-col items-center p-2 align-middle md:p-0">
    <div class="w-full md:w-2/3">
        {#if data.loggedIn}
            <CallToAction
                text="Wil je je leesprofiel aanpassen?"
                href="/leesprofiel"
                linkLabel="Aanpassen"
            />
        {:else}
            <CallToAction text="Wil je persoonlijk leesadvies?" href="/login" linkLabel="Account" />
        {/if}
    </div>

    <div class="mt-6 grid w-full grid-cols-1 gap-4 md:w-2/3 md:grid-cols-2">
        {#await data.advice}
            <p class="sr-only" role="status">Advies laden…</p>
            <BookCardSkeleton count={4} motivation />
        {:then books}
            {#each books as book (book._id)}
                <BookCard
                    {book}
                    inReadingList={readingList?.includes(book._id)}
                    onToggle={readingList ? () => toggleBook(book._id) : undefined}
                />
            {/each}
        {:catch}
            <div class="md:col-span-2">
                <EmptyState title="Advies kon niet geladen worden"
                    >Probeer de pagina later opnieuw te laden.</EmptyState
                >
            </div>
        {/await}
    </div>
</div>

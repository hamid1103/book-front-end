<script lang="ts">
    import BookCard from "$lib/components/BookCard.svelte";
    import CallToAction from "$lib/components/CallToAction.svelte";
    import {toggleReadingListEntry} from "$lib/readingList";

    const {data} = $props();

    let readingList = $derived(data.readingList)

    async function toggleBook(bookId: string) {
        const result = await toggleReadingListEntry(bookId, readingList?.includes(bookId) ?? false);
        // Overrides the derived value until data.readingList changes again
        if (result) readingList = result.book;
    }
</script>

<div class="p-2 md:p-0 w-full h-full flex flex-col items-center align-middle">
    <div class="w-full md:w-2/3">
        {#if data.loggedIn}
            <CallToAction text="Wil je je leesprofiel aanpassen?" href="/leesprofiel" linkLabel="Aanpassen"/>
        {:else}
            <CallToAction text="Wil je persoonlijk leesadvies?" href="/login" linkLabel="Account"/>
        {/if}
    </div>

    <div class="w-full md:w-2/3 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each data.books as book (book._id)}
            <BookCard {book}
                      inReadingList={readingList?.includes(book._id)}
                      onToggle={readingList ? () => toggleBook(book._id) : undefined}/>
        {/each}
    </div>
</div>

<script lang="ts">
    import type {PageProps} from "./$types";
    import BookCard from "$lib/components/BookCard.svelte";
    import type {Book} from "$lib/types";

    let {data}: PageProps = $props();

    let books: Book[] = $derived(data.readingList ?? [])

    async function removeBook(bookId: string) {
        const res = await fetch("/api/leeslijst", {
            method: "POST",
            body: JSON.stringify({bookId, onlyId: false, shouldDelete: true}),
        })
        if (!res.ok) return;

        const result: {UserID: string, book: Book[]} = await res.json();
        books = result.book;
    }
</script>

<div class="w-full min-h-full bg-ivory px-4 py-6 md:py-8">
    <div class="max-w-5xl mx-auto">
        <div class="flex items-end justify-between mb-6 border-b border-border pb-4">
            <div>
                <span class="text-accent font-mono text-sm">Leeslijst</span>
                <h1 class="font-display text-ink text-2xl md:text-3xl font-bold">Jouw leeslijst</h1>
            </div>
            <span class="text-ink-muted font-body">
                {books.length} {books.length === 1 ? 'boek' : 'boeken'}
            </span>
        </div>

        {#if books.length === 0}
            <div class="flex flex-col items-center text-center bg-surface border-2 border-dashed border-border-soft rounded-lg py-16 px-4">
                <h2 class="font-display text-xl text-ink font-bold">Je leeslijst is nog leeg</h2>
                <p class="text-ink-muted font-body mt-1 mb-4">Klik op het hartje bij een boek om het hier te bewaren.</p>
                <a href="/books" class="bg-accent hover:bg-accent-hover text-white font-display px-4 py-2 transition duration-150">
                    Blader door de catalogus
                </a>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each books as book (book._id)}
                    <BookCard {book} inReadingList={true} onToggle={() => removeBook(book._id)}/>
                {/each}
            </div>
        {/if}
    </div>
</div>

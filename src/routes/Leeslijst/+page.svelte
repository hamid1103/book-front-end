<script lang="ts">
    import type {PageProps} from "./$types";
    import Heart from "$lib/components/Heart.svelte";

    type Book = {
        _id: string,
        title: string,
        author: string,
        genre: string[],
        description: string,
        readingLevel: string[],
        tags: string[],
        materialType: string,
    }

    let {data}: PageProps = $props();

    let books: Book[] = $derived(data.readingList ?? [])

    // No book images, so every book gets a generated cover in one of the accent colours
    const coverColors = ['bg-accent', 'bg-accent-sage', 'bg-accent-blue', 'bg-accent-brown'];

    function coverColor(id: string) {
        let hash = 0;
        for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        return coverColors[Math.abs(hash) % coverColors.length];
    }

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
                    <div class="group bg-surface border-2 border-border rounded-lg p-3 md:p-4 flex gap-3 md:gap-4 hover:border-accent hover:shadow-md transition duration-150">
                        <!-- Generated cover -->
                        <a href="/books/{book._id}" class="shrink-0 w-20 h-30 md:w-24 md:h-36 rounded-r-md rounded-l-sm border-l-8 border-black/20 shadow-md p-2 flex flex-col justify-between {coverColor(book._id)}">
                            <span class="font-display text-ivory text-sm font-bold leading-tight line-clamp-4">{book.title}</span>
                            <span class="font-body text-ivory/80 text-[10px] truncate">{book.author}</span>
                        </a>

                        <div class="flex flex-col min-w-0 flex-1">
                            <div class="flex justify-between gap-2">
                                <a href="/books/{book._id}" class="min-w-0">
                                    <h2 class="font-display text-ink text-lg font-bold leading-tight group-hover:text-accent transition">{book.title}</h2>
                                    <p class="font-body text-ink-muted italic text-sm">{book.author}</p>
                                </a>
                                <div class="w-7 h-7 shrink-0" title="Verwijder van leeslijst">
                                    <Heart filled={true} action={() => removeBook(book._id)}></Heart>
                                </div>
                            </div>

                            <p class="font-body text-ink-soft text-sm mt-2 line-clamp-3">{book.description}</p>

                            <div class="flex flex-wrap gap-1.5 mt-auto pt-3">
                                {#each book.readingLevel as level}
                                    <span class="text-xs font-semibold font-body px-2 py-0.5 rounded-full bg-tan-bg text-tan-text">{level}</span>
                                {/each}
                                {#each book.genre as genre}
                                    <span class="text-xs font-body px-2 py-0.5 rounded-full bg-sage-bg text-sage-text border border-sage-border">{genre}</span>
                                {/each}
                                {#each book.tags as tag}
                                    <span class="text-xs font-body px-2 py-0.5 rounded-full border border-border-soft text-ink-muted">#{tag}</span>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

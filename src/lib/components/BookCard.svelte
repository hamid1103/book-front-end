<script lang="ts">
    import type {Book} from "$lib/types";
    import Heart from "$lib/components/Heart.svelte";
    import BookCover from "$lib/components/BookCover.svelte";

    // The heart is only shown when onToggle is passed (e.g. not for logged out users)
    let {book, inReadingList = false, onToggle}: {
        book: Book,
        inReadingList?: boolean,
        onToggle?: () => void,
    } = $props();
</script>

<div class="group bg-surface border-2 border-border rounded-lg p-3 md:p-4 flex gap-3 md:gap-4 hover:border-accent hover:shadow-md transition duration-150">
    <BookCover {book}/>

    <div class="flex flex-col min-w-0 flex-1">
        <div class="flex justify-between gap-2">
            <a href="/books/{book._id}" class="min-w-0">
                <h2 class="font-display text-ink text-lg font-bold leading-tight group-hover:text-accent transition">{book.title}</h2>
                <p class="font-body text-ink-muted italic text-sm">{book.author}</p>
            </a>
            {#if onToggle}
                <div class="w-7 h-7 shrink-0" title={inReadingList ? "Verwijder van leeslijst" : "Voeg toe aan leeslijst"}>
                    <Heart filled={inReadingList} action={onToggle}></Heart>
                </div>
            {/if}
        </div>

        <p class="font-body text-ink-soft text-sm mt-2 line-clamp-3">{book.description}</p>

        {#if book.motivation}
            <div class="mt-3 rounded-md border-l-4 border-accent bg-tan-bg px-3 py-2">
                <p class="font-display text-xs font-bold text-accent">Waarom dit bij jou past</p>
                <p class="font-body text-sm text-ink-soft">{book.motivation}</p>
            </div>
        {/if}

        <div class="flex flex-wrap gap-1.5 mt-auto pt-3">
            {#each book.readingLevel ?? [] as level}
                <span class="text-xs font-semibold font-body px-2 py-0.5 rounded-full bg-tan-bg text-tan-text">{level}</span>
            {/each}
            {#each book.genre ?? [] as genre}
                <span class="text-xs font-body px-2 py-0.5 rounded-full bg-sage-bg text-sage-text border border-sage-border">{genre}</span>
            {/each}
            {#each book.tags ?? [] as tag}
                <span class="text-xs font-body px-2 py-0.5 rounded-full border border-border-soft text-ink-muted">#{tag}</span>
            {/each}
        </div>
    </div>
</div>

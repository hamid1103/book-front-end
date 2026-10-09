<script lang="ts">
    import type { Book } from '$lib/types';
    import Heart from '$lib/components/Heart.svelte';
    import BookCover from '$lib/components/BookCover.svelte';
    import BookTags from '$lib/components/BookTags.svelte';
    import type { Snippet } from 'svelte';

    // The heart is only shown when onToggle is passed (e.g. not for logged out users)
    // children is rendered at the bottom of the card, e.g. the reading status on /Leeslijst
    let {
        book,
        inReadingList = false,
        onToggle,
        children
    }: {
        book: Book;
        inReadingList?: boolean;
        onToggle?: () => void;
        children?: Snippet;
    } = $props();
</script>

<div
    class="group flex gap-3 rounded-lg border-2 border-border bg-surface p-3 transition duration-150 hover:border-accent hover:shadow-md md:gap-4 md:p-4"
>
    <BookCover {book} />

    <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex justify-between gap-2">
            <a href="/books/{book._id}" class="min-w-0">
                <h2
                    class="font-display text-lg leading-tight font-bold text-ink transition group-hover:text-accent"
                >
                    {book.title}
                </h2>
                <p class="font-body text-sm text-ink-muted italic">{book.author}</p>
            </a>
            {#if onToggle}
                <div class="h-7 w-7 shrink-0">
                    <Heart
                        filled={inReadingList}
                        action={onToggle}
                        label="{inReadingList ? 'Verwijder' : 'Voeg'} {book.title} {inReadingList
                            ? 'van'
                            : 'toe aan'} leeslijst"
                    />
                </div>
            {/if}
        </div>

        <p class="mt-2 line-clamp-3 font-body text-sm text-ink-soft">{book.description}</p>

        {#if book.motivation}
            <div class="mt-3 rounded-md border-l-4 border-accent bg-tan-bg px-3 py-2">
                <p class="font-display text-xs font-bold text-accent">Waarom dit bij jou past</p>
                <p class="font-body text-sm text-ink-soft">{book.motivation}</p>
            </div>
        {/if}

        <BookTags {book} />

        {@render children?.()}
    </div>
</div>

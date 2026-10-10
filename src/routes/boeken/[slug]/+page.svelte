<script lang="ts">
    import type { PageProps } from './$types';
    import BookCover from '$lib/components/BookCover.svelte';
    import BookTags from '$lib/components/BookTags.svelte';
    import ReadingStatusPicker from '$lib/components/ReadingStatusPicker.svelte';
    import type { ReadingStatus } from '$lib/types';
    import { setReadingStatus, toggleReadingListEntry } from '$lib/readingList';

    let { data }: PageProps = $props();

    let book = $derived(data.book);
    // $derived so it resets when load reruns, but can be overridden after a request
    let readingList = $derived(data.readingList);
    let inReadingList = $derived(readingList?.book.includes(book._id) ?? false);
    let status: ReadingStatus = $derived(readingList?.status[book._id] ?? 'NotRead');

    let busy = $state(false);

    const MATERIAL_TYPE_LABELS: Record<string, string> = {
        Book: 'Boek',
        Magazine: 'Tijdschrift',
        PoetryBundle: 'Dichtbundel',
        OnlineArticle: 'Online artikel',
        NewspaperArticle: 'Krantenartikel',
        BlogPost: 'Blogpost'
    };

    async function toggle() {
        busy = true;
        const result = await toggleReadingListEntry(book._id, inReadingList);
        if (result) readingList = result;
        busy = false;
    }

    async function changeStatus(newStatus: ReadingStatus) {
        const result = await setReadingStatus(book._id, newStatus);
        if (result) readingList = result;
    }
</script>

<svelte:head>
    <title>{book.title} · Bookie</title>
</svelte:head>

<div class="min-h-full w-full bg-ivory px-4 py-6 md:py-8">
    <div class="mx-auto max-w-3xl">
        <a
            href="/boeken"
            class="mb-4 inline-block font-body text-sm text-accent underline hover:text-accent-hover"
            >← Terug naar de catalogus</a
        >

        <article
            class="flex flex-col gap-4 rounded-lg border-2 border-border bg-surface p-4 sm:flex-row md:gap-6 md:p-6"
        >
            <div class="self-center sm:self-start">
                <BookCover {book} size="lg" />
            </div>

            <div class="flex min-w-0 flex-1 flex-col">
                {#if book.materialType}
                    <span class="font-mono text-sm text-accent"
                        >{MATERIAL_TYPE_LABELS[book.materialType] ?? book.materialType}</span
                    >
                {/if}
                <h1
                    class="font-display text-2xl leading-tight font-bold break-words text-ink md:text-3xl"
                >
                    {book.title}
                </h1>
                <p class="font-body text-ink-muted italic">{book.author}</p>

                {#if readingList}
                    <div class="mt-4 flex flex-col items-start">
                        <button
                            type="button"
                            onclick={toggle}
                            disabled={busy}
                            aria-pressed={inReadingList}
                            class="w-full cursor-pointer rounded-md px-4 py-2 font-body font-semibold transition duration-150 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-60 sm:w-auto
                                       {inReadingList
                                ? 'border-2 border-accent text-accent hover:bg-tan-bg'
                                : 'bg-accent text-white hover:bg-accent-hover'}"
                        >
                            {inReadingList ? 'Verwijder van leeslijst' : 'Voeg toe aan leeslijst'}
                        </button>
                        {#if inReadingList}
                            <ReadingStatusPicker
                                bookId={book._id}
                                title={book.title}
                                {status}
                                onChange={changeStatus}
                            />
                        {/if}
                    </div>
                {:else}
                    <p class="mt-4 font-body text-sm text-ink-muted">
                        <a href="/inloggen" class="text-accent underline hover:text-accent-hover"
                            >Log in</a
                        > om dit boek aan je leeslijst toe te voegen.
                    </p>
                {/if}

                {#if book.description}
                    <h2 class="mt-6 font-display text-lg font-bold text-ink">Beschrijving</h2>
                    <p class="font-body whitespace-pre-line text-ink-soft">{book.description}</p>
                {/if}

                <BookTags {book} />

                {#if book.sourceUrl}
                    <a
                        href={book.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-4 font-body text-sm text-accent underline hover:text-accent-hover"
                        >Bekijk de bron</a
                    >
                {/if}
            </div>
        </article>
    </div>
</div>

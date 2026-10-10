<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageProps } from './$types';
    import BookCard from '$lib/components/BookCard.svelte';
    import ReadingProfileSummary from '$lib/components/ReadingProfileSummary.svelte';
    import Badge, { type BadgeVariant } from '$lib/components/Badge.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import SearchForm from '$lib/components/SearchForm.svelte';
    import { READING_STATUS_LABELS, type ReadingStatus } from '$lib/types';

    let { data, form }: PageProps = $props();

    let student = $derived(data.student);
    let books = $derived(data.readingList ?? []);
    let onList = $derived(new Set(books.map((book) => book._id)));

    // Books without an entry count as not read, same as the backend
    const statusOf = (bookId: string): ReadingStatus => data.readStatus?.[bookId] ?? 'NotRead';
    let readCount = $derived(books.filter((book) => statusOf(book._id) === 'Read').length);

    const statusBadge: Record<ReadingStatus, BadgeVariant> = {
        NotRead: 'outline',
        Reading: 'tan',
        Read: 'solid'
    };

    // Id of the book being added, so only that button shows it's busy
    let pending: string | null = $state(null);
</script>

<svelte:head>
    <title>Leeslijst van {student.userName} · Bookie</title>
</svelte:head>

<div class="min-h-full w-full bg-ivory px-4 py-6 md:py-8">
    <div class="mx-auto max-w-5xl">
        <a
            href="/leerlingen"
            class="mb-3 inline-block font-display text-sm text-accent hover:underline"
            >← Alle leerlingen</a
        >

        <PageHeader
            eyebrow="Leerling"
            title="Leeslijst van {student.userName}"
            subtitle={student.email}
        >
            {readCount} van {books.length} gelezen
        </PageHeader>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
            <section aria-labelledby="list-heading" class="min-w-0">
                <h2 id="list-heading" class="mb-3 font-display text-xl font-bold text-ink">
                    Leeslijst
                </h2>
                {#if books.length === 0}
                    <p
                        class="rounded-lg border-2 border-dashed border-border-soft bg-surface p-6 text-center font-body text-ink-soft"
                    >
                        De leeslijst van {student.userName} is nog leeg. Voeg hiernaast een boek toe.
                    </p>
                {:else}
                    <div class="grid grid-cols-1 gap-4">
                        {#each books as book (book._id)}
                            <BookCard {book}>
                                <p class="mt-3 font-body text-sm">
                                    <span class="text-ink-muted">Leesstatus:</span>
                                    <Badge variant={statusBadge[statusOf(book._id)]}
                                        >{READING_STATUS_LABELS[statusOf(book._id)]}</Badge
                                    >
                                </p>
                            </BookCard>
                        {/each}
                    </div>
                {/if}
            </section>

            <aside class="flex min-w-0 flex-col gap-6">
                <section
                    aria-labelledby="profile-heading"
                    class="rounded-lg border-2 border-border bg-surface p-4"
                >
                    <h2 id="profile-heading" class="mb-2 font-display text-lg font-bold text-ink">
                        Leesprofiel
                    </h2>
                    <ReadingProfileSummary profile={student.readingProfile} />
                </section>

                <section
                    aria-labelledby="add-heading"
                    class="rounded-lg border-2 border-border bg-surface p-4"
                >
                    <h2 id="add-heading" class="mb-2 font-display text-lg font-bold text-ink">
                        Boek toevoegen
                    </h2>
                    <SearchForm
                        label="Zoek een titel in de catalogus"
                        placeholder="Zoek op titel"
                        value={data.q}
                    />

                    <div aria-live="polite">
                        {#if form?.message}
                            <p
                                class="mt-3 rounded-md border-2 border-accent px-3 py-2 font-body text-sm text-accent"
                            >
                                {form.message}
                            </p>
                        {/if}
                    </div>

                    {#if data.results}
                        {#if data.results.books.length === 0}
                            <p class="mt-3 font-body text-sm text-ink-soft">
                                Geen boeken gevonden.
                            </p>
                        {:else}
                            <p class="mt-3 font-body text-xs text-ink-muted">
                                {data.results.total} resultaten{data.results.total >
                                data.results.books.length
                                    ? `, de eerste ${data.results.books.length} worden getoond`
                                    : ''}
                            </p>
                            <ul class="mt-2 flex flex-col divide-y divide-border-soft">
                                {#each data.results.books as book (book._id)}
                                    <li class="flex items-center gap-3 py-2">
                                        <div class="min-w-0 flex-1">
                                            <a
                                                href="/boeken/{book._id}"
                                                class="line-clamp-2 block font-display text-sm leading-tight font-bold text-ink hover:text-accent"
                                                >{book.title}</a
                                            >
                                            <p
                                                class="truncate font-body text-xs text-ink-muted italic"
                                            >
                                                {book.author}
                                            </p>
                                        </div>
                                        {#if onList.has(book._id)}
                                            <span class="shrink-0 font-body text-xs text-sage-text"
                                                >Staat al op de lijst</span
                                            >
                                        {:else}
                                            <form
                                                method="POST"
                                                action="?/add"
                                                use:enhance={() => {
                                                    pending = book._id;
                                                    return async ({ update }) => {
                                                        // Keep the search query and results, load reruns and refreshes the list
                                                        await update({ reset: false });
                                                        pending = null;
                                                    };
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="bookId"
                                                    value={book._id}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={pending === book._id}
                                                    class="shrink-0 border-2 border-accent px-2 py-1 font-display text-xs text-accent transition duration-150 hover:bg-accent hover:text-white disabled:cursor-wait disabled:opacity-60"
                                                >
                                                    Toevoegen<span class="sr-only"
                                                        >: {book.title}</span
                                                    >
                                                </button>
                                            </form>
                                        {/if}
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {/if}
                </section>
            </aside>
        </div>
    </div>
</div>

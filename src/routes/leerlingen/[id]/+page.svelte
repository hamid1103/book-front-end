<script lang="ts">
    import {enhance} from "$app/forms";
    import type {PageProps} from "./$types";
    import BookCard from "$lib/components/BookCard.svelte";
    import ReadingProfileSummary from "$lib/components/ReadingProfileSummary.svelte";
    import Badge, {type BadgeVariant} from "$lib/components/Badge.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import SearchForm from "$lib/components/SearchForm.svelte";
    import {READING_STATUS_LABELS, type ReadingStatus} from "$lib/types";

    let {data, form}: PageProps = $props();

    let student = $derived(data.student)
    let books = $derived(data.readingList ?? [])
    let onList = $derived(new Set(books.map(book => book._id)))

    // Books without an entry count as not read, same as the backend
    const statusOf = (bookId: string): ReadingStatus => data.readStatus?.[bookId] ?? 'NotRead'
    let readCount = $derived(books.filter(book => statusOf(book._id) === 'Read').length)

    const statusBadge: Record<ReadingStatus, BadgeVariant> = {
        NotRead: 'outline',
        Reading: 'tan',
        Read: 'solid',
    }

    // Id of the book being added, so only that button shows it's busy
    let pending: string | null = $state(null)
</script>

<div class="w-full min-h-full bg-ivory px-4 py-6 md:py-8">
    <div class="max-w-5xl mx-auto">
        <a href="/leerlingen" class="inline-block mb-3 text-sm font-display text-accent hover:underline">← Alle leerlingen</a>

        <PageHeader eyebrow="Leerling" title="Leeslijst van {student.userName}" subtitle={student.email}>
            {readCount} van {books.length} gelezen
        </PageHeader>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6">
            <section aria-labelledby="list-heading" class="min-w-0">
                <h2 id="list-heading" class="font-display text-xl text-ink font-bold mb-3">Leeslijst</h2>
                {#if books.length === 0}
                    <p class="bg-surface border-2 border-dashed border-border-soft rounded-lg p-6 text-center font-body text-ink-soft">
                        De leeslijst van {student.userName} is nog leeg. Voeg hiernaast een boek toe.
                    </p>
                {:else}
                    <div class="grid grid-cols-1 gap-4">
                        {#each books as book (book._id)}
                            <BookCard {book}>
                                <p class="mt-3 text-sm font-body">
                                    <span class="text-ink-muted">Leesstatus:</span>
                                    <Badge variant={statusBadge[statusOf(book._id)]}>{READING_STATUS_LABELS[statusOf(book._id)]}</Badge>
                                </p>
                            </BookCard>
                        {/each}
                    </div>
                {/if}
            </section>

            <aside class="flex flex-col gap-6 min-w-0">
                <section aria-labelledby="profile-heading" class="bg-surface border-2 border-border rounded-lg p-4">
                    <h2 id="profile-heading" class="font-display text-lg text-ink font-bold mb-2">Leesprofiel</h2>
                    <ReadingProfileSummary profile={student.readingProfile}/>
                </section>

                <section aria-labelledby="add-heading" class="bg-surface border-2 border-border rounded-lg p-4">
                    <h2 id="add-heading" class="font-display text-lg text-ink font-bold mb-2">Boek toevoegen</h2>
                    <SearchForm label="Zoek een titel in de catalogus" placeholder="Zoek op titel" value={data.q}/>

                    <div aria-live="polite">
                        {#if form?.message}
                            <p class="mt-3 rounded-md border-2 border-accent px-3 py-2 text-sm font-body text-accent">{form.message}</p>
                        {/if}
                    </div>

                    {#if data.results}
                        {#if data.results.books.length === 0}
                            <p class="mt-3 text-sm font-body text-ink-soft">Geen boeken gevonden.</p>
                        {:else}
                            <p class="mt-3 text-xs font-body text-ink-muted">
                                {data.results.total} resultaten{data.results.total > data.results.books.length ? `, de eerste ${data.results.books.length} worden getoond` : ''}
                            </p>
                            <ul class="mt-2 flex flex-col divide-y divide-border-soft">
                                {#each data.results.books as book (book._id)}
                                    <li class="flex items-center gap-3 py-2">
                                        <div class="min-w-0 flex-1">
                                            <a href="/books/{book._id}" class="block font-display text-sm font-bold text-ink leading-tight hover:text-accent line-clamp-2">{book.title}</a>
                                            <p class="font-body text-xs text-ink-muted italic truncate">{book.author}</p>
                                        </div>
                                        {#if onList.has(book._id)}
                                            <span class="shrink-0 text-xs font-body text-sage-text">Staat al op de lijst</span>
                                        {:else}
                                            <form method="POST" action="?/add"
                                                  use:enhance={() => {
                                                      pending = book._id;
                                                      return async ({update}) => {
                                                          // Keep the search query and results, load reruns and refreshes the list
                                                          await update({reset: false});
                                                          pending = null;
                                                      };
                                                  }}>
                                                <input type="hidden" name="bookId" value={book._id}/>
                                                <button type="submit" disabled={pending === book._id}
                                                        aria-label="Voeg {book.title} toe aan de leeslijst van {student.userName}"
                                                        class="shrink-0 border-2 border-accent text-accent hover:bg-accent hover:text-white font-display text-xs px-2 py-1 transition duration-150 disabled:opacity-60 disabled:cursor-wait">
                                                    Toevoegen
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

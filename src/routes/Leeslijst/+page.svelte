<script lang="ts">
    import type {PageProps} from "./$types";
    import BookCard from "$lib/components/BookCard.svelte";
    import ReadingStatusPicker from "$lib/components/ReadingStatusPicker.svelte";
    import ChoiceGroup from "$lib/components/ChoiceGroup.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import type {Book, ReadingStatus} from "$lib/types";
    import {removeFromReadingList, setReadingStatus} from "$lib/readingList";

    let {data}: PageProps = $props();

    let books: Book[] = $derived(data.readingList ?? [])
    let status: Record<string, ReadingStatus> = $derived(data.readStatus ?? {})

    // Books without an entry count as not read, same as the backend
    const statusOf = (bookId: string): ReadingStatus => status[bookId] ?? 'NotRead'

    const tabs: {value: ReadingStatus | 'All', label: string}[] = [
        {value: 'All', label: 'Alle'},
        {value: 'NotRead', label: 'Nog niet gelezen'},
        {value: 'Reading', label: 'Bezig'},
        {value: 'Read', label: 'Gelezen'},
    ]
    let activeTab: ReadingStatus | 'All' = $state('All')

    let counts = $derived(Object.fromEntries(tabs.map(tab => [
        tab.value,
        tab.value === 'All' ? books.length : books.filter(book => statusOf(book._id) === tab.value).length,
    ])))
    let tabChoices = $derived(tabs.map(tab => ({...tab, count: counts[tab.value]})))
    let visibleBooks = $derived(activeTab === 'All' ? books : books.filter(book => statusOf(book._id) === activeTab))

    async function removeBook(bookId: string) {
        const result = await removeFromReadingList(bookId);
        if (!result) return;
        // Overrides the derived values until data changes again
        books = result.book;
        status = result.status;
    }

    async function changeStatus(bookId: string, newStatus: ReadingStatus) {
        const previous = status;
        // Optimistic, so the radio and the counts update right away
        status = {...status, [bookId]: newStatus};
        const result = await setReadingStatus(bookId, newStatus);
        status = result ? result.status : previous;
    }
</script>

<div class="w-full min-h-full bg-ivory px-4 py-6 md:py-8">
    <div class="max-w-5xl mx-auto">
        <PageHeader eyebrow="Leeslijst" title="Jouw leeslijst">{counts.Read} van {books.length} gelezen</PageHeader>

        {#if books.length === 0}
            <EmptyState title="Je leeslijst is nog leeg">
                Klik op het hartje bij een boek om het hier te bewaren.
                {#snippet action()}
                    <a href="/books" class="bg-accent hover:bg-accent-hover text-white font-display px-4 py-2 transition duration-150">
                        Blader door de catalogus
                    </a>
                {/snippet}
            </EmptyState>
        {:else}
            <ChoiceGroup class="mb-4" legend="Toon boeken met leesstatus" hideLegend name="status-filter" type="radio"
                         options={tabChoices} bind:value={activeTab}/>

            {#if visibleBooks.length === 0}
                <p class="bg-surface border-2 border-border rounded-lg p-6 text-center font-body text-ink-soft">
                    Geen boeken met deze status.
                </p>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each visibleBooks as book (book._id)}
                    <BookCard {book} inReadingList={true} onToggle={() => removeBook(book._id)}>
                        <ReadingStatusPicker bookId={book._id} title={book.title} status={statusOf(book._id)}
                                             onChange={(newStatus) => changeStatus(book._id, newStatus)}/>
                    </BookCard>
                {/each}
            </div>
        {/if}
    </div>
</div>

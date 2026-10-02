<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import type {PageProps} from './$types';
    import Heart from "$lib/components/Heart.svelte";
    let {data}: PageProps = $props();
    // $derived (not $state) so these update when load reruns after goto
    let meta = $derived(data.meta)
    let books = $derived(data.books)
    let readingList = $derived(data.readingList)

    let nextTarget = $derived(meta.page+1)
    let lastTarget = $derived(Math.ceil(meta.total / meta.limit))
    let previousTarget = $derived(meta.page-1)

    $effect(()=>{
        console.log(readingList)
    })

    async function updateRLEntry(bookId: string, shouldDelete: boolean) {
        const body = {
            bookId: bookId,
            onlyId: true,
            shouldDelete
        }
        const localApi = await fetch("/api/leeslijst", {
            method: "POST",
            body: JSON.stringify(body),
        })
        if (!localApi.ok) return;

        const result: {UserID: string, book: string[]} = await localApi.json();
        console.log(result)
        // Overrides the derived value until data.readingList changes again
        readingList = result.book;
    }

    function goToPage(TargetPage: number, limit: number = meta.limit)
    {
        let query = new URLSearchParams(page.url.searchParams);
        query.set('page', String(TargetPage));
        query.set('limit', String(limit));
        goto('?' + query.toString(), { noScroll: true, keepFocus: true });
    }
</script>
<div class="w-full h-full flex justify-center bg-ivory">
    <div class="w-2/5 h-fit items-center align-middle flex flex-col space-y-2 p-2">

        {#each books as book}
            <!--href="/books/{book._id}"-->
            <div  class="p-2 w-full h-32 rounded-md bg-surface border-border border-2 flex justify-between">
                <div class="flex space-x-2">
                    <!--Image (place) holder... We don't have images-->
                    <div class="border bg-gray-400 w-24"></div>

                    <div class="flex flex-col justify-end">
                        <span class="font-sans text-ink text-lg">{book.title}</span>
                        <span class="font-sans text-ink-muted text-md italic">{book.author}</span>
                    </div>
                </div>

                <div class="h-full flex flex-col">
                    <div class="w-12 h-12 rounded-md">
                        {#if readingList}
                            <Heart action={()=>{
                                updateRLEntry(book._id,readingList.includes(book._id))
                                //console.log("HEART CLICKED. FAV: " + readingList.includes(book._id))
                            }} filled={readingList.includes(book._id)}></Heart>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}

        <div class="w-full h-10 bg-surface flex justify-between rounded-md border-border border-2 sticky bottom-0 z-0">

            {#each [
                {label: '«', target: 1, disabled: meta.page <= 1, title: 'First page'},
                {label: '‹ Prev', target: previousTarget, disabled: meta.page <= 1, title: 'Previous page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-2 py-1 text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

            <span class="font-display">Page {meta.page} of {Math.ceil(meta.total / meta.limit)}</span>

            {#each [
                {label: 'Next ›', target: nextTarget, disabled: meta.page >= lastTarget, title: 'Next page'},
                {label: '»', target: lastTarget, disabled: meta.page >= lastTarget, title: 'Last page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-2 py-1 text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

        </div>
    </div>
</div>
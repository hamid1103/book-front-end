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

    const coverColors = ['bg-accent', 'bg-accent-sage', 'bg-accent-blue', 'bg-accent-brown'];

    function coverColor(id: string) {
        let hash = 0;
        for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        return coverColors[Math.abs(hash) % coverColors.length];
    }

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
    <div class="w-full md:w-3/4 lg:w-2/5 h-fit items-center align-middle flex flex-col space-y-2 p-2">

        {#each books as book}
            <!--href="/books/{book._id}"-->
            <div class="group hover:border-accent transition duration-100 p-2 w-full min-h-32 rounded-md bg-surface border-border border-2 flex justify-between">
                <div class="flex space-x-2 min-w-0 flex-1">
                    <!--We don't have images-->
                    <a href="/books/{book._id}" class="shrink-0 w-20 h-30 md:w-24 md:h-36 rounded-r-md rounded-l-sm border-l-8 border-black/20 shadow-md p-2 flex flex-col justify-between {coverColor(book._id)}">
                        <span class="font-display text-ivory text-sm font-bold leading-tight line-clamp-4">{book.title}</span>
                        <span class="font-body text-ivory/80 text-[10px] truncate">{book.author}</span>
                    </a>

                    <div class="flex flex-col min-w-0">
                        <a class="hover:cursor-pointer" href="/books/{book._id}">
                            <span class="group-hover:text-accent font-bold transition duration-75 font-sans text-ink text-base md:text-lg leading-tight">{book.title}</span>
                        </a>
                        <span class="font-sans text-ink-muted text-md italic">{book.author}</span>
                        <p class="font-sans text-ink text-md italic truncate">{book.description}</p>
                    </div>
                </div>

                <div class="h-full flex flex-col shrink-0">
                    <div class="w-9 h-9 md:w-12 md:h-12 rounded-md">
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

        <div class="w-full h-10 bg-surface flex justify-between items-center gap-1 px-1 text-sm md:text-base rounded-md border-border border-2 sticky bottom-0 z-0">

            {#each [
                {label: '«', target: 1, disabled: meta.page <= 1, title: 'First page'},
                {label: '‹ Prev', target: previousTarget, disabled: meta.page <= 1, title: 'Previous page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-1.5 md:px-2 py-0.5 md:py-1 whitespace-nowrap text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

            <span class="font-display whitespace-nowrap">Page {meta.page} of {Math.ceil(meta.total / meta.limit)}</span>

            {#each [
                {label: 'Next ›', target: nextTarget, disabled: meta.page >= lastTarget, title: 'Next page'},
                {label: '»', target: lastTarget, disabled: meta.page >= lastTarget, title: 'Last page'},
            ] as btn}
                <button
                        type="button"
                        title={btn.title}
                        disabled={btn.disabled}
                        class="rounded-md border border-ink-700 px-1.5 md:px-2 py-0.5 md:py-1 whitespace-nowrap text-ink-300 hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        onclick={() => goToPage(btn.target)}
                >{btn.label}</button>
            {/each}

        </div>
    </div>
</div>
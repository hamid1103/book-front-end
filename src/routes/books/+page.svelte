<script lang="ts">
    import type {PageProps} from './$types';

    let {data}: PageProps = $props();
</script>
<div class="w-full h-full flex flex-wrap space-x-4 space-y-2">
    {#each data.books as book}
        <a href="/books/{book._id}">
            <div class="w-52 h-24 bg-surface border-border border-2 flex flex-col items-center">
                <span class="font-sans text-ink">{book.title}</span>
                <span class="font-sans text-ink-muted italic">{book.author}</span>
            </div>
        </a>
    {/each}
</div>
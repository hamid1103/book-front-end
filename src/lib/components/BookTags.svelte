<script lang="ts">
    import type {Book} from "$lib/types";
    import Badge from "$lib/components/Badge.svelte";

    // Reading levels, genres and tags of a book, shown on cards and in the homepage carousel
    let {book}: {book: Book} = $props();
</script>

<div class="flex flex-wrap gap-1.5 mt-auto pt-3">
    {#each book.readingLevel ?? [] as level}
        <Badge variant="tan">{level}</Badge>
    {/each}
    {#each book.genre ?? [] as genre}
        <Badge variant="sage">{genre}</Badge>
    {/each}
    {#each book.tags ?? [] as tag}
        <Badge>#{tag}</Badge>
    {/each}
</div>

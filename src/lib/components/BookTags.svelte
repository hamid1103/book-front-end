<script lang="ts">
    import type { Book } from '$lib/types';
    import Badge from '$lib/components/Badge.svelte';

    // Reading levels, genres and tags of a book, shown on cards and in the homepage carousel
    let { book }: { book: Book } = $props();
</script>

<!-- Keyed by index: the imported catalogue can list the same tag twice, and duplicate keys throw -->
<div class="mt-auto flex flex-wrap gap-1.5 pt-3">
    {#each book.readingLevel ?? [] as level, i (i)}
        <Badge variant="tan">{level}</Badge>
    {/each}
    {#each book.genre ?? [] as genre, i (i)}
        <Badge variant="sage">{genre}</Badge>
    {/each}
    {#each book.tags ?? [] as tag, i (i)}
        <Badge>#{tag}</Badge>
    {/each}
</div>

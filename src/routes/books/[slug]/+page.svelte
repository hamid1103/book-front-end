<script lang="ts">
    import type {PageProps} from './$types';

    let {data}: PageProps = $props();
</script>
<div class="flex flex-col w-full">
    <span>{data.book._id}</span>
    <span>Title: {data.book.title}</span>
    <span>Author: {data.book.author}</span>
    <div>
        <span>Genres:</span>
        {#each data.book.genre as genre}
            <span>{genre}</span>
        {/each}
    </div>
    <span>{data.book.description}</span>
    <div>
        <span>Tags: </span>
        {#each data.book.tags as tag}
            <span>{tag}</span>
        {/each}
    </div>
    <span>{data.book?.materialType}</span>
</div>
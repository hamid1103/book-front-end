<script lang="ts">
    import type {Book} from "$lib/types";

    let {book, size = "sm"}: {book: Book, size?: "sm" | "lg"} = $props();

    // No book images, so every book gets a generated cover in one of the accent colours
    const coverColors = ['bg-accent', 'bg-accent-sage', 'bg-accent-blue', 'bg-accent-brown'];

    function coverColor(id: string) {
        let hash = 0;
        for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        return coverColors[Math.abs(hash) % coverColors.length];
    }
</script>

<a href="/books/{book._id}"
   class="shrink-0 rounded-r-md rounded-l-sm border-l-8 border-black/20 shadow-md p-2 flex flex-col justify-between {coverColor(book._id)}
          {size === 'lg' ? 'w-24 h-36 md:w-36 md:h-56' : 'w-20 h-30 md:w-24 md:h-36'}">
    <span class="font-display text-ivory font-bold leading-tight line-clamp-4 {size === 'lg' ? 'text-lg' : 'text-sm'}">{book.title}</span>
    <span class="font-body text-ivory/80 truncate {size === 'lg' ? 'text-sm' : 'text-[10px]'}">{book.author}</span>
</a>

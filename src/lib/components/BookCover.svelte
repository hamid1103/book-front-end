<script lang="ts">
    import type { Book } from '$lib/types';

    let { book, size = 'sm' }: { book: Book; size?: 'sm' | 'lg' } = $props();

    // No book images, so every book gets a generated cover in one of the accent colours
    const coverColors = ['bg-accent', 'bg-accent-sage', 'bg-accent-blue', 'bg-accent-brown'];

    function coverColor(id: string) {
        let hash = 0;
        for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        return coverColors[Math.abs(hash) % coverColors.length];
    }
</script>

<a
    href="/boeken/{book._id}"
    class="flex shrink-0 flex-col justify-between rounded-l-sm rounded-r-md border-l-8 border-black/20 p-2 shadow-md {coverColor(
        book._id
    )}
          {size === 'lg' ? 'h-36 w-24 md:h-56 md:w-36' : 'h-30 w-20 md:h-36 md:w-24'}"
>
    <span
        class="line-clamp-4 font-display leading-tight font-bold text-ivory {size === 'lg'
            ? 'text-lg'
            : 'text-sm'}">{book.title}</span
    >
    <span class="truncate font-body text-ivory {size === 'lg' ? 'text-sm' : 'text-[10px]'}"
        >{book.author}</span
    >
</a>

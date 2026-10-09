<script lang="ts">
    // Placeholder in the shape of BookCard, shown while books are loading
    let { count = 1, motivation = false }: { count?: number; motivation?: boolean } = $props();
</script>

{#each { length: count }}
    <div
        class="flex animate-pulse gap-3 rounded-lg border-2 border-border bg-surface p-3 motion-reduce:animate-none md:gap-4 md:p-4"
        aria-hidden="true"
    >
        <div
            class="h-30 w-20 shrink-0 rounded-l-sm rounded-r-md bg-border-soft md:h-36 md:w-24"
        ></div>

        <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="h-5 w-3/4 rounded bg-border-soft"></div>
            <div class="h-3 w-1/3 rounded bg-border-soft"></div>
            <div class="mt-2 h-3 w-full rounded bg-border-soft"></div>
            <div class="h-3 w-full rounded bg-border-soft"></div>
            <div class="h-3 w-2/3 rounded bg-border-soft"></div>
            {#if motivation}
                <div class="mt-1 h-12 w-full rounded-md bg-border-soft"></div>
            {/if}
            <div class="mt-1 flex gap-2">
                <div class="h-5 w-10 rounded-full bg-border-soft"></div>
                <div class="h-5 w-14 rounded-full bg-border-soft"></div>
            </div>
        </div>
    </div>
{/each}

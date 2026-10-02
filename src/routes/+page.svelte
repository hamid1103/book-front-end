<script lang="ts">
    // With this setup, I can dynamically add carousel slides. Not sure why I would want that :P
    import {GeneralState} from "$lib/GeneralState.svelte.ts";

    const coverColors = ['bg-accent', 'bg-accent-sage', 'bg-accent-blue', 'bg-accent-brown'];

    function coverColor(id: string) {
        let hash = 0;
        for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        return coverColors[Math.abs(hash) % coverColors.length];
    }

    let holder: HTMLElement = $state();
    let {data} = $props();

    let advice = $derived(data.advice)
    let current = $state(0);
    let paused = $state(false);

    const next = () => (current = (current + 1) % holder.children.length);
    const prev = () => (current = (current - 1 + holder.children.length) % holder.children.length);

    // Swipe left/right on touch screens
    let touchStartX = 0;
    function onTouchStart(e: TouchEvent) {
        touchStartX = e.touches[0].clientX;
        paused = true;
    }
    function onTouchEnd(e: TouchEvent) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40) next();
        else if (dx > 40) prev();
        paused = false;
    }

    // Auto-advance every 5s, unless the mouse is over the carousel
    $effect(() => {
        if (paused) return;
        const id = setInterval(next, 5000);
        return () => clearInterval(id);
    });
</script>

<div class="w-full h-full flex items-center space-y-5 p-4 flex-col">
    <div class="bg-surface w-full md:w-9/12 md:h-64 flex text-ink rounded-md border-2 border-accent p-2 md:p-4">
        {#if GeneralState.user}
            <div class="flex flex-col w-full md:w-1/2 p-2 space-y-2">
                <span class="text-accent text-md font-mono">Welkom terug.</span>
                <h1 class="text-2xl md:text-4xl font-bold font-display">Hoi {GeneralState.user.userName}, klaar voor je volgende
                    boek?</h1>
                <div class="flex flex-col sm:flex-row gap-3 md:gap-14 font-display">
                    <button class="text-center hover:cursor-pointer bg-accent p-2 hover:bg-accent-hover border-accent hover:border-accent-hover border text-white transition duration-150">
                        Bekijk mijn advies
                    </button>
                    <a href="/books"
                       class="text-center hover:cursor-pointer border-accent p-2 hover:border-accent-hover border text-ink hover:bg-gray-200 transition duration-150">
                        Blader door de catalogus
                    </a>
                </div>
            </div>
            <!-- Decorative image, hidden on mobile to save space -->
            <div class="hidden md:flex flex-col w-1/2 h-full justify-center p-2">
                <div class="h-11/12 rounded-lg bg-tan-bg flex justify-center items-center">
                    <img src="/HomeBookImage.png" alt="Plaatje van een leeg boek."/>
                </div>
            </div>
        {:else}
            <div class="flex flex-col w-full md:w-1/2 p-2 space-y-2">
                <span class="text-accent text-md font-mono">Welkom!</span>
                <h1 class="text-2xl md:text-4xl font-bold font-display">Hallo! Klaar om je leeslijst te starten?</h1>
                <div class="flex flex-col sm:flex-row gap-3 md:gap-14 font-display">
                    <button class="text-center hover:cursor-pointer bg-accent p-2 hover:bg-accent-hover border-accent hover:border-accent-hover border text-white transition duration-150">
                        Vul je leesprofiel in.
                    </button>
                    <a href="/books"
                       class="text-center hover:cursor-pointer border-accent p-2 hover:border-accent-hover border text-ink hover:bg-gray-200 transition duration-150">
                        Blader door de catalogus
                    </a>
                </div>
            </div>
            <!-- Decorative image, hidden on mobile to save space -->
            <div class="hidden md:flex flex-col w-1/2 h-full justify-center p-2">
                <div class="h-11/12 rounded-lg bg-tan-bg flex justify-center items-center">
                    <img src="/HomeBookImage.png" alt="Plaatje van een leeg boek."/>
                </div>
            </div>
        {/if}
    </div>

    <div
            class="w-full md:w-1/2 rounded-sm h-80 relative overflow-hidden"
            role="region"
            aria-label="Carousel"
            onmouseenter={() => (paused = true)}
            onmouseleave={() => (paused = false)}
            ontouchstart={onTouchStart}
            ontouchend={onTouchEnd}
    >
        <div bind:this={holder} class="flex h-full transition-transform duration-500"
             style="transform: translateX(-{current * 100}%)">
            {#each advice as book}
                <div class="w-full h-full flex justify-center items-center p-2 shrink-0 bg-surface">
                    <div class="w-full px-8 md:px-0 md:w-3/4 flex gap-4">
                        <a href="/books/{book._id}"
                           class="shrink-0 w-24 h-36 md:w-36 md:h-56 rounded-r-md rounded-l-sm border-l-8 border-black/20 shadow-md p-2 flex flex-col justify-between {coverColor(book._id)}">
                            <span class="font-display text-ivory text-lg font-bold leading-tight line-clamp-4">{book.title}</span>
                            <span class="font-body text-ivory/80 text-[10px] truncate">{book.author}</span>
                        </a>
                        <div class="flex flex-col justify-start font-display min-w-0">
                            <h2 class="text-lg md:text-2xl font-display">Heb je deze al geprobeert?</h2>
                            <span class="text-sm md:text-base line-clamp-[10] md:line-clamp-none">{book.description}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <button
                class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ivory/80 hover:bg-ivory text-ink font-bold cursor-pointer"
                onclick={prev}
                aria-label="Vorige"
        >‹
        </button>
        <button
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ivory/80 hover:bg-ivory text-ink font-bold cursor-pointer"
                onclick={next}
                aria-label="Volgende"
        >›
        </button>

        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {#if holder}
                {#each holder.children as _, i}
                    <button
                            class="w-2.5 h-2.5 rounded-full cursor-pointer transition {i === current ? 'bg-ivory' : 'bg-ivory/50'}"
                            onclick={() => (current = i)}
                            aria-label="Ga naar slide {i + 1}"
                    ></button>
                {/each}
            {/if}
        </div>
    </div>
</div>

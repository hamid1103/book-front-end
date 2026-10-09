<script lang="ts">
    import BookCover from "$lib/components/BookCover.svelte";
    import BookTags from "$lib/components/BookTags.svelte";

    let {data} = $props();

    // data.user comes from the layout load
    let user = $derived(data.user)
    let advice = $derived(data.advice)
    let hero = $derived(user
        ? {eyebrow: 'Welkom terug.', title: `Hoi ${user.userName}, klaar voor je volgende boek?`, href: '/advies', cta: 'Bekijk mijn advies'}
        : {eyebrow: 'Welkom!', title: 'Hallo! Klaar om je leeslijst te starten?', href: '/register', cta: 'Maak een account aan'})
    let current = $state(0);
    // stopped is the pause button, hovered/focused pause it temporarily (WCAG 2.2.2)
    let stopped = $state(false);
    let hovered = $state(false);
    let focused = $state(false);
    let rotating = $derived(!stopped && !hovered && !focused && advice.length > 1);

    // Users that asked for less motion start with a stopped carousel
    $effect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stopped = true;
    });

    // Math.max avoids NaN when the advice request failed and there are no slides
    const next = () => (current = (current + 1) % Math.max(advice.length, 1));
    const prev = () => (current = (current - 1 + advice.length) % Math.max(advice.length, 1));

    // Swipe left/right on touch screens
    let touchStartX = 0;
    function onTouchStart(e: TouchEvent) {
        touchStartX = e.touches[0].clientX;
        hovered = true;
    }
    function onTouchEnd(e: TouchEvent) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40) next();
        else if (dx > 40) prev();
        hovered = false;
    }

    // Only unpause when focus leaves the carousel, not when it moves between its buttons
    function onFocusOut(e: FocusEvent) {
        if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) focused = false;
    }

    // Auto-advance every 5s, unless paused, hovered or focused
    $effect(() => {
        if (!rotating) return;
        const id = setInterval(next, 5000);
        return () => clearInterval(id);
    });
</script>

<div class="w-full h-full flex items-center space-y-5 p-4 flex-col">
    <div class="bg-surface w-full md:w-9/12 md:h-64 flex text-ink rounded-md border-2 border-accent p-2 md:p-4">
        <div class="flex flex-col w-full md:w-1/2 p-2 space-y-2">
            <span class="text-accent text-md font-mono">{hero.eyebrow}</span>
            <h1 class="text-2xl md:text-4xl font-bold font-display">{hero.title}</h1>
            <div class="flex flex-col sm:flex-row gap-3 md:gap-14 font-display">
                <a href={hero.href} class="text-center hover:cursor-pointer bg-accent p-2 hover:bg-accent-hover border-accent hover:border-accent-hover border text-white transition duration-150">
                    {hero.cta}
                </a>
                <a href="/books"
                   class="text-center hover:cursor-pointer border-accent p-2 hover:border-accent-hover border text-ink hover:bg-tan-bg transition duration-150">
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
    </div>

    <div
            class="w-full md:w-1/2 rounded-sm h-80 relative overflow-hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label="Boekadvies"
            onmouseenter={() => (hovered = true)}
            onmouseleave={() => (hovered = false)}
            onfocusin={() => (focused = true)}
            onfocusout={onFocusOut}
            ontouchstart={onTouchStart}
            ontouchend={onTouchEnd}
    >
        <!-- Screen readers only announce slide changes the user made, not the automatic ones -->
        <div class="flex h-full transition-transform duration-500 motion-reduce:transition-none"
             style="transform: translateX(-{current * 100}%)"
             aria-live={rotating ? 'off' : 'polite'}>
            {#each advice as book, i}
                <!-- inert keeps the links of hidden slides out of the tab order -->
                <div class="w-full h-full flex justify-center items-center p-2 shrink-0 bg-surface"
                     role="group" aria-roledescription="slide" aria-label="{i + 1} van {advice.length}"
                     inert={i !== current}>
                    <div class="w-full px-8 md:px-0 md:w-3/4 flex gap-4">
                        <BookCover {book} size="lg"/>
                        <div class="flex flex-col justify-start font-display min-w-0">
                            <h2 class="text-lg md:text-2xl font-display">Heb je deze al geprobeert?</h2>
                            <span class="text-sm md:text-base line-clamp-[10] md:line-clamp-none">Beschrijving: {book.description}</span>
                            {#if book.motivation}
                                <span class="text-sm md:text-base italic text-accent mt-1 line-clamp-3">{book.motivation}</span>
                            {/if}
                            <BookTags {book}/>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <button
                class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-accent bg-ivory/80 hover:bg-ivory text-ink font-bold cursor-pointer"
                onclick={prev}
                aria-label="Vorige"
        >‹
        </button>
        <button
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-accent bg-ivory/80 hover:bg-ivory text-ink font-bold cursor-pointer"
                onclick={next}
                aria-label="Volgende"
        >›
        </button>

        {#if advice.length > 1}
            <button
                    class="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-accent bg-ivory/80 hover:bg-ivory text-ink font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                    onclick={() => (stopped = !stopped)}
                    aria-label={stopped ? 'Start carousel' : 'Pauzeer carousel'}
                    title={stopped ? 'Start carousel' : 'Pauzeer carousel'}
            >
                <span aria-hidden="true">{stopped ? '▶' : '⏸'}</span>
            </button>
        {/if}

        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {#each advice as _, i}
                    <button
                            class="w-2.5 h-2.5 rounded-full cursor-pointer transition {i === current ? 'bg-ivory' : 'bg-ivory/50'}"
                            onclick={() => (current = i)}
                            aria-label="Ga naar slide {i + 1}"
                            aria-current={i === current ? 'true' : undefined}
                    ></button>
            {/each}
        </div>
    </div>
</div>

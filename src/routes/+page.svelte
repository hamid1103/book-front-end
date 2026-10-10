<script lang="ts">
    import BookCover from '$lib/components/BookCover.svelte';
    import BookTags from '$lib/components/BookTags.svelte';

    let { data } = $props();

    // data.user comes from the layout load
    let user = $derived(data.user);
    let advice = $derived(data.advice);
    let hero = $derived(
        user
            ? {
                  eyebrow: 'Welkom terug.',
                  title: `Hoi ${user.userName}, klaar voor je volgende boek?`,
                  href: '/advies',
                  cta: 'Bekijk mijn advies'
              }
            : {
                  eyebrow: 'Welkom!',
                  title: 'Hallo! Klaar om je leeslijst te starten?',
                  href: '/register',
                  cta: 'Maak een account aan'
              }
    );
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

<svelte:head>
    <title>Bookie · Leesadvies dat bij je past</title>
</svelte:head>

<div class="flex h-full w-full flex-col items-center space-y-5 p-4">
    <div
        class="flex w-full rounded-md border-2 border-accent bg-surface p-2 text-ink md:h-64 md:w-9/12 md:p-4"
    >
        <div class="flex w-full flex-col space-y-2 p-2 md:w-1/2">
            <span class="text-md font-mono text-accent">{hero.eyebrow}</span>
            <h1 class="font-display text-2xl font-bold md:text-4xl">{hero.title}</h1>
            <div class="flex flex-col gap-3 font-display sm:flex-row md:gap-14">
                <a
                    href={hero.href}
                    class="border border-accent bg-accent p-2 text-center text-white transition duration-150 hover:cursor-pointer hover:border-accent-hover hover:bg-accent-hover"
                >
                    {hero.cta}
                </a>
                <a
                    href="/books"
                    class="border border-accent p-2 text-center text-ink transition duration-150 hover:cursor-pointer hover:border-accent-hover hover:bg-tan-bg"
                >
                    Blader door de catalogus
                </a>
            </div>
        </div>
        <!-- Decorative image, hidden on mobile to save space -->
        <div class="hidden h-full w-1/2 flex-col justify-center p-2 md:flex">
            <div class="flex h-11/12 items-center justify-center rounded-lg bg-tan-bg">
                <img src="/HomeBookImage.png" alt="" />
            </div>
        </div>
    </div>

    <div
        class="relative h-80 w-full overflow-hidden rounded-sm md:w-1/2"
        role="region"
        aria-roledescription="carrousel"
        aria-label="Boekadvies"
        onmouseenter={() => (hovered = true)}
        onmouseleave={() => (hovered = false)}
        onfocusin={() => (focused = true)}
        onfocusout={onFocusOut}
        ontouchstart={onTouchStart}
        ontouchend={onTouchEnd}
    >
        <!-- Screen readers only announce slide changes the user made, not the automatic ones -->
        <div
            class="flex h-full transition-transform duration-500 motion-reduce:transition-none"
            style="transform: translateX(-{current * 100}%)"
            aria-live={rotating ? 'off' : 'polite'}
        >
            {#each advice as book, i (book._id)}
                <!-- inert keeps the links of hidden slides out of the tab order -->
                <div
                    class="flex h-full w-full shrink-0 items-center justify-center bg-surface p-2"
                    role="group"
                    aria-roledescription="dia"
                    aria-label="{i + 1} van {advice.length}"
                    inert={i !== current}
                >
                    <div class="flex w-full gap-4 px-8 md:w-3/4 md:px-0">
                        <BookCover {book} size="lg" />
                        <div class="flex min-w-0 flex-col justify-start font-display">
                            <h2 class="font-display text-lg md:text-2xl">
                                Heb je deze al geprobeerd?
                            </h2>
                            <span class="line-clamp-[10] text-sm md:line-clamp-none md:text-base"
                                >Beschrijving: {book.description}</span
                            >
                            {#if book.motivation}
                                <span
                                    class="mt-1 line-clamp-3 text-sm text-accent italic md:text-base"
                                    >{book.motivation}</span
                                >
                            {/if}
                            <BookTags {book} />
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <button
            class="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 cursor-pointer rounded-full border-2 border-accent bg-ivory/80 font-bold text-ink hover:bg-ivory"
            onclick={prev}
            aria-label="Vorige"
            >‹
        </button>
        <button
            class="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 cursor-pointer rounded-full border-2 border-accent bg-ivory/80 font-bold text-ink hover:bg-ivory"
            onclick={next}
            aria-label="Volgende"
            >›
        </button>

        {#if advice.length > 1}
            <button
                class="absolute right-2 bottom-2 h-8 w-8 cursor-pointer rounded-full border-2 border-accent bg-ivory/80 font-bold text-ink hover:bg-ivory focus-visible:ring-2 focus-visible:ring-accent"
                onclick={() => (stopped = !stopped)}
                aria-label={stopped ? 'Start carrousel' : 'Pauzeer carrousel'}
                title={stopped ? 'Start carrousel' : 'Pauzeer carrousel'}
            >
                <span aria-hidden="true">{stopped ? '▶' : '⏸'}</span>
            </button>
        {/if}

        <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
            {#each advice as book, i (book._id)}
                <button
                    class="h-2.5 w-2.5 cursor-pointer rounded-full border-2 border-accent transition {i ===
                    current
                        ? 'bg-accent'
                        : 'bg-surface'}"
                    onclick={() => (current = i)}
                    aria-label="Ga naar dia {i + 1}"
                    aria-current={i === current ? 'true' : undefined}
                ></button>
            {/each}
        </div>
    </div>
</div>

<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page, navigating } from '$app/state';
    import { refreshAll } from '$app/navigation';
    let { data, children } = $props();
    let user = $derived(data.user);

    // Deletes the session cookie, then reruns the load functions so the page shows the logged out state.
    // Pages that need a login redirect to /login from their load
    const Uitloggen = async () => {
        await fetch('/logout', { method: 'POST' });
        menuOpen = false;
        await refreshAll();
    };

    // Students link themselves to a teacher, teachers see their linked students (FR6)
    let links = $derived([
        { href: '/', label: 'Home' },
        { href: '/books', label: 'Catalogus' },
        { href: '/Leeslijst', label: 'Leeslijst' },
        { href: '/advies', label: 'Advies' },
        ...(user?.role === 'student' ? [{ href: '/docenten', label: 'Docenten' }] : []),
        ...(user?.role === 'teacher' ? [{ href: '/leerlingen', label: 'Leerlingen' }] : []),
        ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Beheer' }] : [])
    ]);
    const isActive = (href: string) =>
        href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

    // Account menu: opens on click, closes with Escape, a click outside it, or when focus leaves it (WCAG 1.4.13)
    let menuOpen = $state(false);
    let menu: HTMLElement;
    let menuButton: HTMLButtonElement;
    function onMenuKeydown(e: KeyboardEvent) {
        if (e.key !== 'Escape' || !menuOpen) return;
        menuOpen = false;
        menuButton.focus();
    }
    function onMenuFocusOut(e: FocusEvent) {
        if (!menu.contains(e.relatedTarget as Node)) menuOpen = false;
    }
    function onWindowClick(e: MouseEvent) {
        if (menuOpen && !menu.contains(e.target as Node)) menuOpen = false;
    }
    // Close the menu after navigating, e.g. to /login
    $effect(() => {
        void page.url.pathname;
        menuOpen = false;
    });
</script>

<svelte:window onclick={onWindowClick} />

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>
<div class="h-full w-full">
    <!-- First thing to tab to, skips the header (WCAG 2.4.1) -->
    <a
        href="#main"
        class="sr-only z-50 rounded-md bg-accent px-4 py-2 font-body font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >Naar de inhoud</a
    >
    {#if navigating.to}
        <!-- Above the sticky header (z-40) -->
        <div
            class="fixed top-0 left-0 z-50 h-1 w-full animate-pulse bg-accent"
            role="progressbar"
            aria-label="Pagina laden"
        ></div>
    {/if}
    <!-- On mobile the nav wraps onto its own row under the logo and avatar -->
    <header
        class="sticky top-0 z-40 flex w-full zoom-150 flex-wrap items-center justify-between gap-y-2 bg-ivory px-4 pt-3 pb-2 font-display md:h-20 md:flex-nowrap md:p-4"
    >
        <div class="flex items-center">
            <img class="mt-1 h-6 w-6" src="/bookico.png" alt="" />
            <span class="text-xl font-bold">Bookie</span>
        </div>
        <nav
            class="order-last flex w-full justify-between gap-3 overflow-x-auto text-sm font-bold sm:justify-center sm:text-base md:order-none md:w-1/4 md:gap-4 md:overflow-visible md:text-lg"
        >
            {#each links as link (link.href)}
                <a
                    href={link.href}
                    class="whitespace-nowrap hover:underline {isActive(link.href)
                        ? 'border-b-2 border-b-accent pb-1 md:pb-2'
                        : ''}"
                    aria-current={isActive(link.href) ? 'page' : undefined}
                >
                    {link.label}
                </a>
            {/each}
        </nav>
        <div class="flex items-center justify-end">
            <!-- The div only catches Escape and focus changes from the button and links inside it -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="relative"
                bind:this={menu}
                onkeydown={onMenuKeydown}
                onfocusout={onMenuFocusOut}
            >
                <button
                    type="button"
                    bind:this={menuButton}
                    onclick={() => (menuOpen = !menuOpen)}
                    aria-label="Account"
                    aria-expanded={menuOpen}
                    aria-controls="account-menu"
                    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-bold text-ivory {user
                        ? 'bg-accent-blue'
                        : 'bg-accent-brown'}"
                >
                    {user ? user.userName[0].toUpperCase() : '?'}
                </button>
                <div
                    id="account-menu"
                    class="absolute top-full right-0 z-50 pt-2 {menuOpen ? '' : 'hidden'}"
                >
                    <div
                        class="w-36 rounded-lg border border-border bg-surface p-4 font-body shadow-lg md:w-56"
                    >
                        {#if user}
                            <p class="font-display font-bold text-ink">{user.userName}</p>
                            <p class="truncate text-sm text-ink-muted">{user.email}</p>
                            <button
                                type="button"
                                onclick={Uitloggen}
                                class="md:text-md cursor-pointer font-display text-sm text-accent hover:underline"
                                >Uitloggen</button
                            >
                        {:else}
                            <p class="mb-3 text-sm text-ink-muted">Je bent niet ingelogd.</p>
                            <a
                                href="/login"
                                class="block rounded-md bg-accent py-1.5 text-center font-semibold text-ivory hover:bg-accent-hover"
                            >
                                Inloggen
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </header>
    <!-- tabindex so the skip link moves focus here, not only the scroll position -->
    <main id="main" tabindex="-1" class="h-full w-full outline-none">
        {@render children()}
    </main>
</div>

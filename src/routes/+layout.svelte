<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/state'
    import {GeneralState} from "$lib/GeneralState.svelte.ts";
    const links = [
        {href: '/', label: 'Home'},
        {href: '/books', label: 'Catalogue'},
        {href: '/Leeslijst', label: 'Leeslijst'},
        {href: "/advies", label: 'Advies'},
    ]

    let {data, children} = $props();
    let user = $derived(data.user)
    let books = $derived(data.book)

    $effect(()=>{
        GeneralState.user = user;
        GeneralState.readinglist = books;
    })

    const isActive = (href) => href === '/'? page.url.pathname === '/' : page.url.pathname.startsWith(href)

</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>
<div class="w-full h-full">
    <!-- On mobile the nav wraps onto its own row under the logo and avatar -->
    <header class="sticky top-0 z-40 font-display px-4 pt-3 pb-2 md:p-4 bg-ivory w-full md:h-20 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 zoom-150">
        <div class="flex items-center">
            <img class="h-6 w-6 mt-1" src="/bookico.png" alt="logo" />
            <span class="font-bold text-xl">Bookie</span>
        </div>
        <nav class="order-last md:order-none flex w-full md:w-1/4 gap-3 md:gap-4 font-bold text-sm sm:text-base md:text-lg justify-between sm:justify-center overflow-x-auto md:overflow-visible">
            {#each links as link}
                <a
                        href={link.href} class="whitespace-nowrap hover:underline {isActive(link.href) ? 'border-b-2 pb-1 md:pb-2 border-b-accent' : ''}"
                        aria-current={isActive(link.href) ? 'page' : undefined}
                >
                    {link.label}
                </a>
            {/each}
        </nav>
        <div class="flex justify-end items-center">
            <div class="group relative">
                <!-- A button so tapping it on touch screens opens the card via focus-within -->
                <button type="button" aria-label="Account" class="w-10 h-10 rounded-full flex items-center justify-center text-ivory font-bold cursor-pointer {user ? 'bg-accent-blue' : 'bg-accent-brown'}">
                    {user ? user.userName[0].toUpperCase() : '?'}
                </button>
                <!-- pt-2 bridges the gap so the card stays open while moving the mouse onto it -->
                <div class="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition absolute right-0 top-full pt-2 z-50">
                    <div class="w-36 md:w-56 rounded-lg border border-border bg-surface p-4 shadow-lg font-body">
                        {#if user}
                            <p class="font-display font-bold text-ink">{user.userName}</p>
                            <p class="text-sm text-ink-muted truncate">{user.email}</p>
                        {:else}
                            <p class="text-sm text-ink-muted mb-3">Je bent niet ingelogd.</p>
                            <a href="/login" class="block text-center rounded-md bg-accent hover:bg-accent-hover text-ivory font-semibold py-1.5">
                                Inloggen
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </header>
    <div class="h-full w-full">
        {@render children()}
    </div>
</div>
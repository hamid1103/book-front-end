<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/state'
    const links = [
        {href: '/', label: 'Home'},
        {href: '/books', label: 'Catalogue'},
        {href: '/Leeslijst', label: 'Leeslijst'},
    ]

    const isActive = (href) => href === '/'? page.url.pathname === '/' : page.url.pathname.startsWith(href)

    let {children} = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>
<header class="font-display p-4 bg-ivory w-full h-20 flex justify-between items-center">
    <div class="flex items-center">
        <img class="h-6 w-6 mt-1" src="/bookico.png" alt="logo" />
        <span class="font-bold text-xl">Bookie</span>
    </div>
    <div class="flex w-1/4 space-x-4 font-bold text-lg justify-center">
        {#each links as link}
        <a
                href={link.href} class="hover:underline {isActive(link.href) ? 'border-b-2 pb-2 border-b-accent' : ''}"
                aria-current={isActive(link.href) ? 'page' : undefined}
        >
            {link.label}
        </a>
        {/each}
    </div>
    <div class="flex justify-end items-center">
        <div class="w-10 h-10 rounded-full bg-accent-brown"></div>
    </div>
</header>
{@render children()}

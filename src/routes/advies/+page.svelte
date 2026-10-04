<script lang="ts">
    import BookCard from "$lib/components/BookCard.svelte";

    const {data} = $props();
</script>

<div class="w-full h-full flex flex-col items-center align-middle">
    <div class="w-2/3">
        {#if data.loggedIn}
        <div class="hidden w-full p-4 bg-surface border-accent border-4 rounded-md md:flex items-center justify-center">
            <span class="text-2xl font-body font-bold text-ink">Wil je je leesprofiel aanpassen?</span>
            <a href="/leesprofiel" class="cursor-pointer flex items-center bg-accent transition duration-100 hover:bg-accent-hover text-center p-2 text-xl font-bold font-display ml-8 text-amber-50 rounded "><span>Aanpassen</span> <div class="w-12 object-contain"> <img src="/right-arrow.svg" alt="right arrow"></div></a>
        </div>

        <a class="w-full" href="/leesprofiel">
        <div class="md:hidden p-2 flex items-center bg-accent text-amber-50 w-full">
            <span class="font-bold font-display text-xl">Wil je je leesprofiel aanpassen?</span>
            <div class="w-12 object-contain"> <img src="/right-arrow.svg" alt="right arrow"></div>
        </div>
        </a>

            {:else}

            <div class="hidden w-full p-4 bg-surface border-accent border-4 rounded-md md:flex items-center justify-center">
                <span class="text-2xl font-body font-bold text-ink">Wilt U persoonlijk leesadvies?</span>
                <a href="/login" class="cursor-pointer flex items-center bg-accent transition duration-100 hover:bg-accent-hover text-center p-2 text-xl font-bold font-display ml-8 text-amber-50 rounded "><span>Aanpassen</span> <div class="w-12 object-contain"> <img src="/right-arrow.svg" alt="right arrow"></div></a>
            </div>

            <a class="w-full" href="/login">
                <div class="md:hidden p-2 flex items-center bg-accent text-amber-50 w-full">
                    <span class="font-bold font-display text-xl">Wilt U persoonlijk leesadvies?</span>
                    <div class="w-12 object-contain"> <img src="/right-arrow.svg" alt="right arrow"></div>
                </div>
            </a>

        {/if}
    </div>

    <div class="w-2/3 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each data.books as book (book._id)}
            <BookCard {book}/>
        {/each}
    </div>
</div>

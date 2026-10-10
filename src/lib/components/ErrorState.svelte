<script lang="ts">
    // Friendly explanation for a failed page, used by +error.svelte.
    // message is only shown when it adds something, the backend's English status texts are hidden
    let { status, message }: { status: number; message?: string } = $props();

    const texts: Record<number, { title: string; description: string }> = {
        400: {
            title: 'Ongeldig verzoek',
            description: 'Er klopt iets niet aan de link of de gegevens die zijn verstuurd.'
        },
        401: {
            title: 'Je bent niet ingelogd',
            description: 'Log in om deze pagina te bekijken.'
        },
        403: {
            title: 'Geen toegang',
            description: 'Je account heeft geen toegang tot deze pagina.'
        },
        404: {
            title: 'Pagina niet gevonden',
            description:
                'Deze pagina bestaat niet (meer). Controleer de link of ga terug naar de homepage.'
        }
    };
    const serverError = {
        title: 'Er ging iets mis',
        description: 'Er ging iets mis aan onze kant. Probeer het over een paar minuten opnieuw.'
    };
    const genericMessages = new Set([
        'Bad Request',
        'Unauthorized',
        'Forbidden',
        'Not Found',
        'Internal Error',
        'Internal Server Error',
        'Bad Gateway',
        'Service Unavailable',
        'Gateway Timeout'
    ]);

    let text = $derived(texts[status] ?? serverError);
    let detail = $derived(
        message && !genericMessages.has(message) && message !== text.description ? message : null
    );
    let canRetry = $derived(status >= 500);
    // The homepage link is the main button when there's no login or retry button
    let homeIsPrimary = $derived(status !== 401 && !canRetry);
</script>

<svelte:head>
    <title>{text.title} · Bookie</title>
</svelte:head>

<section
    class="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-border bg-surface px-4 py-12 text-center md:px-8 md:py-16"
    aria-labelledby="error-title"
>
    <p class="font-display text-7xl font-bold text-accent md:text-8xl">
        <span class="sr-only">Foutcode</span>
        {status}
    </p>
    <h1 id="error-title" class="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">
        {text.title}
    </h1>
    <p class="mt-2 max-w-md font-body text-ink-muted">{text.description}</p>
    {#if detail}
        <p class="mt-3 rounded-md bg-tan-bg px-3 py-2 font-body text-sm text-tan-text">{detail}</p>
    {/if}

    <div class="mt-6 flex flex-wrap justify-center gap-3 font-body font-semibold">
        {#if status === 401}
            <a
                href="/inloggen"
                class="rounded-md bg-accent px-4 py-2 text-ivory hover:bg-accent-hover"
            >
                Inloggen
            </a>
        {/if}
        {#if canRetry}
            <button
                type="button"
                onclick={() => location.reload()}
                class="cursor-pointer rounded-md bg-accent px-4 py-2 text-ivory hover:bg-accent-hover"
            >
                Probeer opnieuw
            </button>
        {/if}
        <a
            href="/"
            class="rounded-md px-4 py-2 {homeIsPrimary
                ? 'bg-accent text-ivory hover:bg-accent-hover'
                : 'border border-border-soft text-ink hover:bg-ivory'}"
        >
            Naar de homepage
        </a>
        <a
            href="/boeken"
            class="rounded-md border border-border-soft px-4 py-2 text-ink hover:bg-ivory"
        >
            Bekijk de catalogus
        </a>
    </div>
</section>

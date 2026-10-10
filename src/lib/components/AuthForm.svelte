<script lang="ts">
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';
    import type { Snippet } from 'svelte';

    // Shared card for /inloggen and /registreren: title, error alert, the fields (children) and a footer link
    let {
        title,
        subtitle,
        errorTitle,
        error,
        submitLabel,
        onInput,
        children,
        footer
    }: {
        title: string;
        subtitle: string;
        errorTitle: string;
        error?: string | null;
        submitLabel: string;
        // Called when the user types, so the page can hide the error
        onInput?: () => void;
        children: Snippet;
        footer: Snippet;
    } = $props();

    let submitting = $state(false);
</script>

<div
    class="flex min-h-full w-full items-start justify-center bg-ivory px-4 py-8 md:items-center md:py-16"
>
    <div class="w-full max-w-md">
        <div class="mb-6 flex flex-col items-center text-center">
            <img class="mb-2 h-10 w-10" src="/bookico.png" alt="" />
            <h1 class="font-display text-2xl font-bold text-ink md:text-3xl">{title}</h1>
            <p class="mt-1 font-body text-ink-muted">{subtitle}</p>
        </div>

        <form
            class="flex flex-col gap-4 rounded-lg border-2 border-border bg-surface p-5 shadow-md md:p-6"
            method="POST"
            oninput={onInput}
            use:enhance={() => {
                submitting = true;
                return async ({ update }) => {
                    await update({ reset: false });
                    submitting = false;
                };
            }}
        >
            {#if error}
                <div
                    role="alert"
                    class="flex items-start gap-2 rounded-md border border-l-4 border-accent/30 border-l-accent bg-accent/10 p-3 text-sm"
                    transition:fly={{ y: -8, duration: 200 }}
                >
                    <svg
                        class="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <div>
                        <p class="font-display font-bold text-accent-hover">{errorTitle}</p>
                        <p class="font-body text-ink-soft">{error}</p>
                    </div>
                </div>
            {/if}

            {@render children()}

            <button
                class="mt-2 w-full rounded-md bg-accent py-2.5 font-display font-bold text-white transition duration-150 hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Even geduld…' : submitLabel}
            </button>
        </form>

        <p class="mt-4 text-center font-body text-ink-soft">
            {@render footer()}
        </p>
    </div>
</div>

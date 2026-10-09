<script lang="ts">
    import {enhance} from '$app/forms';
    import {fly} from 'svelte/transition';
    import type {Snippet} from 'svelte';

    // Shared card for /login and /register: title, error alert, the fields (children) and a footer link
    let {title, subtitle, errorTitle, error, submitLabel, onInput, children, footer}: {
        title: string,
        subtitle: string,
        errorTitle: string,
        error?: string | null,
        submitLabel: string,
        // Called when the user types, so the page can hide the error
        onInput?: () => void,
        children: Snippet,
        footer: Snippet,
    } = $props();

    let submitting = $state(false);
</script>

<div class="flex w-full min-h-full bg-ivory justify-center items-start md:items-center px-4 py-8 md:py-16">
    <div class="w-full max-w-md">
        <div class="flex flex-col items-center text-center mb-6">
            <img class="h-10 w-10 mb-2" src="/bookico.png" alt="" />
            <h1 class="font-display text-ink text-2xl md:text-3xl font-bold">{title}</h1>
            <p class="font-body text-ink-muted mt-1">{subtitle}</p>
        </div>

        <form
            class="bg-surface border-2 border-border rounded-lg shadow-md p-5 md:p-6 flex flex-col gap-4"
            method="POST"
            oninput={onInput}
            use:enhance={() => {
                submitting = true;
                return async ({update}) => {
                    await update({reset: false});
                    submitting = false;
                };
            }}
        >
            {#if error}
                <div
                    role="alert"
                    class="flex items-start gap-2 rounded-md border border-accent/30 border-l-4 border-l-accent bg-accent/10 p-3 text-sm"
                    transition:fly={{y: -8, duration: 200}}
                >
                    <svg class="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                    </svg>
                    <div>
                        <p class="font-display font-bold text-accent-hover">{errorTitle}</p>
                        <p class="font-body text-ink-soft">{error}</p>
                    </div>
                </div>
            {/if}

            {@render children()}

            <button
                class="mt-2 w-full bg-accent hover:bg-accent-hover text-white font-display font-bold py-2.5 rounded-md transition duration-150 disabled:opacity-60 disabled:cursor-wait"
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Even geduld…' : submitLabel}
            </button>
        </form>

        <p class="text-center font-body text-ink-soft mt-4">
            {@render footer()}
        </p>
    </div>
</div>

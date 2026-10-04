<script lang="ts">
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';
    import type { PageProps } from './$types';

    let { form }: PageProps = $props();

    let submitting = $state(false);
    let dismissed = $state(false);

    const error = $derived(dismissed ? null : form?.error);
    const inputClass = $derived(
        `w-full rounded-md border bg-surface text-ink transition-colors focus:ring-2 ${
            error
                ? 'border-accent bg-accent/5 focus:border-accent focus:ring-accent/30'
                : 'border-border-soft focus:border-accent-sage focus:ring-accent-sage/30'
        }`
    );
</script>

<div class="flex w-full bg-ivory h-full justify-around p-2">
    <div class="h-full w-full sm:w-2/3 lg:w-1/3 flex justify-center flex-col items-center align-middle">
        <h1 class="text-2xl md:text-3xl text-center font-display font-bold p-1">Login / Registreren</h1>
        <form
            class="md:h-2/5 w-full border bg-surface flex flex-col space-y-2 p-2"
            method="POST"
            use:enhance={() => {
                submitting = true;
                dismissed = false;
                return async ({ update }) => {
                    await update();
                    submitting = false;
                };
            }}
        >
            {#if error}
                <div
                    role="alert"
                    class="flex items-start gap-2 rounded-md border border-accent/30 border-l-4 border-l-accent bg-accent/10 p-3 text-sm text-accent-hover"
                    transition:fly={{ y: -8, duration: 200 }}
                >
                    <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                    </svg>
                    <div class="flex-1">
                        <p class="font-display font-bold">Inloggen mislukt</p>
                        <p class="text-ink-soft">{error}</p>
                    </div>
                    <button
                        type="button"
                        class="rounded p-0.5 text-accent/70 hover:bg-accent/10 hover:text-accent-hover"
                        aria-label="Melding sluiten"
                        onclick={() => (dismissed = true)}
                    >
                        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                    </button>
                </div>
            {/if}
            <div class="w-full md:h-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <label for="email" class="text-md font-bold p-1 md:whitespace-nowrap">E-mail Address</label>
                <input
                    id="email"
                    name="email"
                    class={inputClass}
                    type="text"
                    placeholder="Email Address"
                    value={form?.email ?? ''}
                    aria-invalid={error ? 'true' : undefined}
                    oninput={() => (dismissed = true)}
                    required
                />
            </div>
            <div class="w-full md:h-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <label for="password" class="text-md font-bold p-1 md:whitespace-nowrap">Wachtwoord</label>
                <input
                    id="password"
                    name="password"
                    class={inputClass}
                    type="password"
                    placeholder="password"
                    aria-invalid={error ? 'true' : undefined}
                    oninput={() => (dismissed = true)}
                    required
                />
            </div>
            <div class="w-full md:h-full flex items-center justify-end pt-2 md:pt-0">
                <button
                    class="bg-accent-sage rounded-md w-full md:w-20 py-2 md:py-0 font-display font-bold text-white hover:bg-green-500 disabled:opacity-60 disabled:cursor-wait"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? '…' : 'Verder'}
                </button>
            </div>
        </form>
    </div>
</div>

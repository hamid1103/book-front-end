<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { enhance } from '$app/forms';
    import { beforeNavigate, goto } from '$app/navigation';
    import ChoiceGroup, { type Choice } from '$lib/components/ChoiceGroup.svelte';
    import { LENGTH_LABELS, MOTIVATION_LABELS, type ReadingProfile } from '$lib/types';
    let { data, form } = $props();

    //Turns a value -> label map into the options of a ChoiceGroup
    const choices = <T extends string>(labels: Record<T, string>): Choice<T>[] =>
        (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));

    const levels: Choice<ReadingProfile['languageLevel']>[] = (
        ['A2', 'B1', 'B2', 'C1'] as const
    ).map((level) => ({ value: level, label: level }));
    const motivations = choices(MOTIVATION_LABELS);
    const lengths = choices(LENGTH_LABELS);
    let themes: Choice[] = $derived(data.tags.map((tag: string) => ({ value: tag, label: tag })));
    const card = 'w-full p-1 md:p-4 bg-surface rounded-lg border-2 border-accent';

    //What ends up in localStorage. `base` is the saved profile the draft started from
    type Draft = { base: string; profile: ReadingProfile };

    const defaults: ReadingProfile = {
        languageLevel: 'A2',
        ReadingMotivation: 'ForSchool',
        length: 'Short',
        genre: []
    };

    //Only keep the form fields (the server also sends _id, userID, __v) and sort the genres,
    //so ticking a theme off and on again doesn't count as a change
    function serialize(p: Partial<ReadingProfile>): string {
        const profile = { ...defaults, ...p };
        return JSON.stringify({
            languageLevel: profile.languageLevel,
            ReadingMotivation: profile.ReadingMotivation,
            length: profile.length,
            genre: [...profile.genre].sort()
        });
    }

    let ProfileData: ReadingProfile = $state(structuredClone(defaults));

    //Use "update" when the server already has a profile, otherwise "create"
    let SDExists = $derived(!!data.readingList);
    //The last saved version of the profile, the form is "dirty" when it differs from this.
    //Only read from data once, after that it's updated on save
    let savedProfile = $state(untrack(() => serialize(data.readingList ?? defaults)));
    let HasUnsavedUpdates = $derived(serialize(ProfileData) !== savedProfile);
    //Per user, so someone else on the same computer doesn't get your draft
    let storageKey = $derived(`ReadingProfileForm:${data.user?.id}`);
    let draftRestored = $state(false);
    let submitting = $state(false);
    let success = $state(false);
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    //Prevents the effect from overwriting localStorage with the defaults before we've loaded it
    let loaded = $state(false);

    beforeNavigate((e) => {
        if (!HasUnsavedUpdates) return;
        //Closing the tab or typing a new URL can't use confirm(), cancelling shows the browser's own dialog
        if (e.type === 'leave') {
            e.cancel();
            return;
        }
        //The draft is already in localStorage, so leaving doesn't lose anything
        if (
            !confirm(
                'Je leesprofiel is nog niet opgeslagen. Je wijzigingen blijven bewaard als concept. Toch weggaan?'
            )
        ) {
            e.cancel();
        }
    });

    onMount(() => {
        Object.assign(ProfileData, JSON.parse(savedProfile));

        //A draft only wins when it was made on top of the profile that's saved now.
        //If the profile was saved somewhere else in the meantime, the draft is outdated
        const draft = readDraft();
        if (draft && draft.base === savedProfile && serialize(draft.profile) !== savedProfile) {
            Object.assign(ProfileData, draft.profile);
            draftRestored = true;
        }
        loaded = true;

        //Don't redirect if the user already navigated away on their own
        return () => clearTimeout(redirectTimer);
    });

    function readDraft(): Draft | null {
        try {
            return JSON.parse(localStorage.getItem(storageKey) ?? 'null');
        } catch {
            //Old format or broken JSON, treat it as no draft
            return null;
        }
    }

    function discardDraft() {
        Object.assign(ProfileData, JSON.parse(savedProfile));
        draftRestored = false;
    }

    //Keeps the draft in localStorage in sync with the form, and removes it once nothing differs from the saved profile
    $effect(() => {
        if (!loaded) return;
        if (HasUnsavedUpdates) {
            const draft: Draft = { base: savedProfile, profile: $state.snapshot(ProfileData) };
            localStorage.setItem(storageKey, JSON.stringify(draft));
        } else {
            localStorage.removeItem(storageKey);
        }
    });
</script>

<div class="flex h-full w-full flex-col p-1 md:space-y-2 md:p-10">
    <h1 class="font-display text-2xl font-bold text-ink md:text-4xl">
        Vertel ons wat je graag leest
    </h1>
    <span class="text-md font-display font-bold text-ink-soft md:w-3/5 md:text-2xl"
        >We gebruiken dit om leesadvies op maat te geven. Dit duurt ongeveer 2 minuten. Je
        antwoorden worden automatisch bewaard, ook als je per ongeluk wegnavigeert.</span
    >
    <form
        class="flex h-full w-full flex-col space-y-3"
        method="POST"
        action="?/{SDExists ? 'update' : 'create'}"
        use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
                submitting = false;
                if (result.type === 'success') {
                    success = true;
                    //The form now matches the saved profile, so the draft gets removed and the prompt won't fire
                    savedProfile = serialize(ProfileData);
                    draftRestored = false;
                    redirectTimer = setTimeout(() => goto('/advies'), 1500);
                } else {
                    //reset: false keeps the bound inputs in sync with ProfileData
                    await update({ reset: false });
                }
            };
        }}
    >
        <div class="flex w-full flex-col gap-3 md:flex-row md:gap-2">
            <ChoiceGroup
                class={card}
                size="lg"
                legend="Lees Niveau"
                name="languageLevel"
                type="radio"
                required
                options={levels}
                bind:value={ProfileData.languageLevel}
            />
            <ChoiceGroup
                class={card}
                size="lg"
                legend="Lees Motivatie"
                name="ReadingMotivation"
                type="radio"
                required
                options={motivations}
                bind:value={ProfileData.ReadingMotivation}
            />
            <ChoiceGroup
                class={card}
                size="lg"
                legend="Lees materiaal duur"
                name="length"
                type="radio"
                required
                options={lengths}
                bind:value={ProfileData.length}
            />
        </div>

        <ChoiceGroup
            class={card}
            size="lg"
            legend="Favoriete Thema's"
            name="genre"
            type="checkbox"
            required
            options={themes}
            bind:value={ProfileData.genre}
        />
        {#if draftRestored && !success}
            <div
                class="flex w-full flex-col justify-between gap-2 rounded-lg border-2 border-accent bg-tan-bg p-3 font-body text-ink md:flex-row md:items-center"
                role="status"
            >
                <span class="font-bold"
                    >Je niet-opgeslagen wijzigingen van de vorige keer zijn teruggezet.</span
                >
                <button
                    type="button"
                    onclick={discardDraft}
                    class="cursor-pointer border-2 border-accent px-3 py-1 font-bold transition duration-150 hover:bg-surface"
                >
                    Wijzigingen weggooien
                </button>
            </div>
        {/if}
        {#if success}
            <div
                class="w-full rounded-lg border-2 border-sage-border bg-sage-bg p-3 text-center font-body text-xl font-bold text-sage-text md:text-2xl"
                role="status"
            >
                Je leesprofiel is opgeslagen! Je wordt doorgestuurd naar je leesadvies...
            </div>
        {:else if form?.error}
            <div
                class="w-full rounded-lg border-2 border-accent bg-accent/10 p-3 text-center font-body text-xl font-bold text-accent-hover md:text-2xl"
                role="alert"
            >
                {form.error}
            </div>
        {/if}
        <div class="flex w-full justify-center">
            <button
                type="submit"
                disabled={submitting || success}
                class="w-1/4 cursor-pointer border-2 border-accent bg-surface p-3 font-body text-xl font-bold transition duration-150 hover:border-accent-hover hover:bg-accent-hover
            disabled:cursor-not-allowed disabled:opacity-50 md:w-2/12 md:text-2xl"
                >{submitting ? 'Bezig...' : 'Submit'}</button
            >
        </div>
    </form>
</div>

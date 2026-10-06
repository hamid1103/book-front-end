<script lang="ts">
    import {onMount, untrack} from "svelte";
    import {enhance} from "$app/forms";
    import {beforeNavigate, goto} from "$app/navigation";
    let {data, form} = $props()

    type Profile = {
        languageLevel: "A2"| "B1" | "B2" | "C1",
        ReadingMotivation: "ForSchool" | "ForPleasure" | "LanguageDevelopment",
        length: "Short" | "Medium" | "Long",
        genre: string[]
    }

    //What ends up in localStorage. `base` is the saved profile the draft started from
    type Draft = {base: string, profile: Profile}

    const defaults: Profile = {
        languageLevel: "A2",
        ReadingMotivation: "ForSchool",
        length: "Short",
        genre: []
    }

    //Only keep the form fields (the server also sends _id, userID, __v) and sort the genres,
    //so ticking a theme off and on again doesn't count as a change
    function serialize(p: Partial<Profile>): string {
        const profile = {...defaults, ...p}
        return JSON.stringify({
            languageLevel: profile.languageLevel,
            ReadingMotivation: profile.ReadingMotivation,
            length: profile.length,
            genre: [...profile.genre].sort(),
        })
    }

    let ProfileData: Profile = $state(structuredClone(defaults))

    //Use "update" when the server already has a profile, otherwise "create"
    let SDExists = $derived(!!data.readingList)
    //The last saved version of the profile, the form is "dirty" when it differs from this.
    //Only read from data once, after that it's updated on save
    let savedProfile = $state(untrack(() => serialize(data.readingList ?? defaults)))
    let HasUnsavedUpdates = $derived(serialize(ProfileData) !== savedProfile)
    //Per user, so someone else on the same computer doesn't get your draft
    let storageKey = $derived(`ReadingProfileForm:${data.user?.id}`)
    let draftRestored = $state(false)
    let submitting = $state(false)
    let success = $state(false)
    let redirectTimer: ReturnType<typeof setTimeout> | undefined
    //Prevents the effect from overwriting localStorage with the defaults before we've loaded it
    let loaded = $state(false)

    beforeNavigate((e)=>{
        if(!HasUnsavedUpdates) return
        //Closing the tab or typing a new URL can't use confirm(), cancelling shows the browser's own dialog
        if(e.type === "leave")
        {
            e.cancel()
            return
        }
        //The draft is already in localStorage, so leaving doesn't lose anything
        if(!confirm("Je leesprofiel is nog niet opgeslagen. Je wijzigingen blijven bewaard als concept. Toch weggaan?"))
        {
            e.cancel()
        }
    })

    onMount(()=>{
        Object.assign(ProfileData, JSON.parse(savedProfile))

        //A draft only wins when it was made on top of the profile that's saved now.
        //If the profile was saved somewhere else in the meantime, the draft is outdated
        const draft = readDraft()
        if(draft && draft.base === savedProfile && serialize(draft.profile) !== savedProfile)
        {
            Object.assign(ProfileData, draft.profile)
            draftRestored = true
        }
        loaded = true

        //Don't redirect if the user already navigated away on their own
        return () => clearTimeout(redirectTimer)
    })

    function readDraft(): Draft | null {
        try {
            return JSON.parse(localStorage.getItem(storageKey) ?? "null")
        } catch {
            //Old format or broken JSON, treat it as no draft
            return null
        }
    }

    function discardDraft() {
        Object.assign(ProfileData, JSON.parse(savedProfile))
        draftRestored = false
    }

    //Keeps the draft in localStorage in sync with the form, and removes it once nothing differs from the saved profile
    $effect(()=>{
        if(!loaded) return
        if(HasUnsavedUpdates)
        {
            const draft: Draft = {base: savedProfile, profile: $state.snapshot(ProfileData)}
            localStorage.setItem(storageKey, JSON.stringify(draft))
        }else{
            localStorage.removeItem(storageKey)
        }
    })
</script>

<div class="w-full h-full flex flex-col p-1 md:p-10 md:space-y-2">
    <h1 class="font-bold font-display text-ink text-2xl md:text-4xl ">Vertel ons wat je graag leest</h1>
    <span class="font-bold font-display text-md md:w-3/5 text-ink-soft md:text-2xl">We gebruiken dit om leesadvies op maat te geven. Dit duurt ongeveer 2 minuten. Je antwoorden worden automatisch bewaard, ook als je per ongeluk wegnavigeert.</span>
    <form class="w-full flex flex-col h-full space-y-3" method="POST" action="?/{SDExists? "update":"create"}"
          use:enhance={()=>{
              submitting = true
              return async ({result, update})=>{
                  submitting = false
                  if(result.type === "success"){
                      success = true;
                      //The form now matches the saved profile, so the draft gets removed and the prompt won't fire
                      savedProfile = serialize(ProfileData);
                      draftRestored = false;
                      redirectTimer = setTimeout(()=>goto("/advies"), 1500);
                  }else{
                      //reset: false keeps the bound inputs in sync with ProfileData
                      await update({reset: false})
                  }
              }
          }}>
        <div class="flex flex-col md:flex-row w-full space-y-3 md:space-y-0 md:space-x-2">
            <div class="flex w-full p-1 md:p-4 flex-col space-y-3 bg-surface rounded-lg border-2 border-accent">
                <span class="text-accent font-body md:text-2xl md:font-bold">Lees Niveau<span class="text-xl text-red-600">*</span></span>
                <div class="flex w-full space-x-2 text-xl">
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full"><span class="pl-2 pr-2">A2</span> <input class="md:ml-2 sr-only" type="radio" name="languageLevel" value="A2" bind:group={ProfileData.languageLevel} required/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="B1"><span class="pl-2 pr-2">B1</span>  <input class="md:ml-2 sr-only" type="radio" name="languageLevel" value="B1" bind:group={ProfileData.languageLevel}/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="B2"><span class="pl-2 pr-2">B2</span>  <input class="md:ml-2 sr-only" type="radio" name="languageLevel" value="B2" bind:group={ProfileData.languageLevel}/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="C1"><span class="pl-2 pr-2">C1</span>  <input class="md:ml-2 sr-only" type="radio" name="languageLevel" value="C1" bind:group={ProfileData.languageLevel}/></label>
                </div>
            </div>

            <div class="flex w-full p-1 md:p-4 flex-col space-y-3 bg-surface rounded-lg border-2 border-accent">
                <span class="text-accent font-body md:text-2xl md:font-bold">Lees Motivatie<span class="text-xl text-red-600">*</span></span>
                <div class="flex w-full flex-col space-y-2 md:space-y-0 md:flex-row space-x-2 text-xl">
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-lg md:rounded-full" id="ForSchool"><span class="pl-2 pr-2">Voor School</span> <input class="md:ml-2 sr-only" type="radio" name="ReadingMotivation" value="ForSchool" bind:group={ProfileData.ReadingMotivation} required/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-lg md:rounded-full" id="ForPleasure"><span class="pl-2 pr-2">Voor de lol</span>  <input class="md:ml-2 sr-only" type="radio" name="ReadingMotivation" value="ForPleasure" bind:group={ProfileData.ReadingMotivation}/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-lg md:rounded-full" id="LanguageDevelopment"><span class="pl-2 pr-2">Taal Ontwikkeling</span>  <input class="md:ml-2 sr-only" type="radio" name="ReadingMotivation" value="LanguageDevelopment" bind:group={ProfileData.ReadingMotivation}/></label>
                </div>
            </div>

            <div class="flex w-full p-1 md:p-4 flex-col space-y-3 bg-surface rounded-lg border-2 border-accent">
                <span class="text-accent font-body md:text-2xl md:font-bold">Lees materiaal duur<span class="text-xl text-red-600">*</span></span>
                <div class="flex w-full space-x-2 text-xl">
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="Short"><span class="pl-2 pr-2">Kort</span> <input class="md:ml-2 sr-only" type="radio" name="length" value="Short" bind:group={ProfileData.length} required/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="Medium"><span class="pl-2 pr-2">Middel</span>  <input class="md:ml-2 sr-only" type="radio" name="length" value="Medium" bind:group={ProfileData.length}/></label>
                    <label class="group cursor-pointer flex transition duration-150 items-center border-2 has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white p-2 rounded-full" id="Long"><span class="pl-2 pr-2">Lang</span>  <input class="md:ml-2 sr-only" type="radio" name="length" value="Long" bind:group={ProfileData.length}/></label>
                </div>
            </div>

        </div>

        <div class="flex w-full p-1 md:p-4 flex-col space-y-3 bg-surface rounded-lg border-2 border-accent">
            <span class="text-accent font-body md:text-2xl md:font-bold">Favoriete Thema's<span class="text-xl text-red-600">*</span></span>

            <div class="flex w-full space-x-2 text-xl space-y-2 flex-wrap">
                {#each data.tags as tag (tag)}
                    <label class="group cursor-pointer text-md font-bold font-body p-1 md:text-2xl flex transition
                duration-150 has-checked:border-accent has-checked:bg-amber-100 border-2">
                        <input name="genre" value={tag} bind:group={ProfileData.genre} type="checkbox" class="sr-only">
                        <span class="pl-2 pr-2 text-accent">{tag}</span>
                    </label>
                {/each}
            </div>
        </div>
        {#if draftRestored && !success}
            <div class="w-full p-3 rounded-lg border-2 border-accent bg-tan-bg text-ink font-body flex flex-col md:flex-row md:items-center justify-between gap-2" role="status">
                <span class="font-bold">Je niet-opgeslagen wijzigingen van de vorige keer zijn teruggezet.</span>
                <button type="button" onclick={discardDraft} class="border-2 border-accent px-3 py-1 font-bold cursor-pointer hover:bg-surface transition duration-150">
                    Wijzigingen weggooien
                </button>
            </div>
        {/if}
        {#if success}
            <div class="w-full p-3 rounded-lg border-2 border-green-600 bg-green-100 text-green-800 font-body font-bold md:text-2xl text-xl text-center" role="status">
                Je leesprofiel is opgeslagen! Je wordt doorgestuurd naar je leesadvies...
            </div>
        {:else if form?.error}
            <div class="w-full p-3 rounded-lg border-2 border-red-600 bg-red-100 text-red-800 font-body font-bold md:text-2xl text-xl text-center" role="alert">
                {form.error}
            </div>
        {/if}
        <div class="w-full flex justify-center">
            <button type="submit" disabled={submitting || success} class="border-2 transition duration-150 hover:bg-accent-hover border-accent p-3 font-body font-bold md:text-2xl text-xl bg-surface w-1/4 md:w-2/12
            hover:border-accent-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Bezig..." : "Submit"}</button>
        </div>
    </form>
</div>
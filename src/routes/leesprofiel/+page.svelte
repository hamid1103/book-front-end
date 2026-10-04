<script lang="ts">
    import {onMount} from "svelte";
    import {enhance} from "$app/forms";
    import {goto} from "$app/navigation";
    let {data, form} = $props()

    type Profile = {
        languageLevel: "A2"| "B1" | "B2" | "C1",
        ReadingMotivation: "ForSchool" | "ForPleasure" | "LanguageDevelopment",
        length: "Short" | "Medium" | "Long",
        genre: string[]
    }

    let ProfileData: Profile = $state({
        languageLevel: "A2",
        ReadingMotivation: "ForSchool",
        length: "Short",
        genre: []
    })

    //Use "update" when the server already has a profile, otherwise "create"
    let SDExists = $derived(!!data.readingList)
    let submitting = $state(false)
    let success = $state(false)
    let redirectTimer: ReturnType<typeof setTimeout> | undefined
    //Prevents the effect from overwriting localStorage with the defaults before we've loaded it
    let loaded = $state(false)

    onMount(()=>{
        //Server Data ALWAYS goes above.
        if(data.readingList)
        {
            Object.assign(ProfileData, data.readingList)
            loaded = true
        }else{
            const storageProfile: Partial<Profile> | null = JSON.parse(localStorage.getItem("ReadingProfileForm") ?? "null")
            if(storageProfile){
                //Merge with defaults so older saved profiles missing a field don't break the form
                Object.assign(ProfileData, storageProfile)
            }
            loaded = true
        }
        //Don't redirect if the user already navigated away on their own
        return () => clearTimeout(redirectTimer)
    })

    //Automatically triggers when anything in ProfileData changes (JSON.stringify reads every field, so it tracks all of them).
    //Only READ state in here; writing to ProfileData inside this effect would re-trigger it forever.
    $effect(()=>{
        const json = JSON.stringify(ProfileData)
        if(loaded) localStorage.setItem("ReadingProfileForm", json)
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
                      success = true
                      redirectTimer = setTimeout(()=>goto("/advies"), 1500)
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
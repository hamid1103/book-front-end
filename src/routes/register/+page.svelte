<script lang="ts">
    import AuthForm from '$lib/components/AuthForm.svelte';
    import FormField from '$lib/components/FormField.svelte';
    import type { PageProps } from './$types';

    let { form }: PageProps = $props();

    // Hidden once the user starts typing again, shown again after the next failed attempt
    let dismissed = $state(false);
    $effect.pre(() => {
        form;
        dismissed = false;
    });
    const error = $derived(dismissed ? null : form?.error);
</script>

<svelte:head><title>Registreren · Bookie</title></svelte:head>

<AuthForm title="Account aanmaken" subtitle="Maak een account en ontvang leesadvies dat bij je past."
          errorTitle="Registreren mislukt" {error} submitLabel="Account aanmaken" onInput={() => (dismissed = true)}>
    <FormField id="username" label="Gebruikersnaam" autocomplete="username" value={form?.username ?? ''} required />
    <FormField id="email" label="E-mailadres" type="email" autocomplete="email" placeholder="jij@voorbeeld.nl"
               value={form?.email ?? ''} required />
    <FormField id="password" label="Wachtwoord" type="password" autocomplete="new-password" minlength={8}
               hint="Minstens 8 tekens." required />
    <FormField id="confirm" label="Herhaal wachtwoord" type="password" autocomplete="new-password" minlength={8} required />

    {#snippet footer()}
        Heb je al een account?
        <a href="/login" class="font-display font-bold text-accent hover:underline">Log hier in</a>
    {/snippet}
</AuthForm>

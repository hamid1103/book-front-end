<script lang="ts">
    import AuthForm from '$lib/components/AuthForm.svelte';
    import FormField from '$lib/components/FormField.svelte';
    import type { PageProps } from './$types';

    let { form }: PageProps = $props();

    // Hidden once the user starts typing again (onInput overrides it), shown again after the
    // next failed attempt because every new form result recomputes the derived value
    let dismissed = $derived(!form);
    const error = $derived(dismissed ? null : form?.error);
</script>

<svelte:head><title>Inloggen · Bookie</title></svelte:head>

<AuthForm
    title="Welkom terug"
    subtitle="Log in om je leeslijst en advies te bekijken."
    errorTitle="Inloggen mislukt"
    {error}
    submitLabel="Inloggen"
    onInput={() => (dismissed = true)}
>
    <FormField
        id="email"
        label="E-mailadres"
        type="email"
        autocomplete="email"
        placeholder="jij@voorbeeld.nl"
        value={form?.email ?? ''}
        invalid={!!error}
        required
    />
    <FormField
        id="password"
        label="Wachtwoord"
        type="password"
        autocomplete="current-password"
        invalid={!!error}
        required
    />

    {#snippet footer()}
        Nog geen account?
        <a href="/register" class="font-display font-bold text-accent hover:underline"
            >Registreer je hier</a
        >
    {/snippet}
</AuthForm>

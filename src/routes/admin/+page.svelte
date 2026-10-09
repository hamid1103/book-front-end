<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageProps } from './$types';
    import type { Role } from '$lib/types';
    import Badge, { type BadgeVariant } from '$lib/components/Badge.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import SearchForm from '$lib/components/SearchForm.svelte';

    let { data, form }: PageProps = $props();

    const ROLE_LABELS: Record<Role, string> = {
        student: 'Student',
        teacher: 'Docent',
        admin: 'Beheerder'
    };
    const roleBadge: Record<Role, BadgeVariant> = {
        student: 'outline',
        teacher: 'sage',
        admin: 'tan'
    };

    let teacherCount = $derived(
        data.accounts.filter((account) => account.role === 'teacher').length
    );
    // Id of the account whose form is being submitted, so only that button shows it's busy
    let pending: number | null = $state(null);
</script>

<div class="min-h-full w-full bg-ivory px-4 py-6 md:py-8">
    <div class="mx-auto max-w-5xl">
        <PageHeader eyebrow="Beheer" title="Accounts en rollen"
            >{data.accounts.length} accounts · {teacherCount} docenten</PageHeader
        >

        <SearchForm
            class="mb-4 max-w-md"
            label="Zoek op gebruikersnaam of e-mail"
            placeholder="Zoek op naam of e-mail"
            value={data.q}
        />

        <div aria-live="polite">
            {#if form?.message}
                <p
                    class="mb-4 rounded-md border-2 px-4 py-2 font-body {form.success
                        ? 'border-sage-border bg-sage-bg text-sage-text'
                        : 'border-accent bg-surface text-accent'}"
                >
                    {form.message}
                </p>
            {/if}
        </div>

        {#if data.accounts.length === 0}
            <p
                class="rounded-lg border-2 border-dashed border-border-soft bg-surface p-6 text-center font-body text-ink-soft"
            >
                Geen accounts gevonden.
            </p>
        {:else}
            <ul class="divide-y divide-border-soft rounded-lg border-2 border-border bg-surface">
                {#each data.accounts as account (account.id)}
                    <li class="flex flex-wrap items-center justify-between gap-3 p-3 md:p-4">
                        <div class="min-w-0">
                            <p class="truncate font-display font-bold text-ink">
                                {account.userName}
                                {#if account.id === data.adminId}<span
                                        class="font-body text-sm font-normal text-ink-muted"
                                        >(jij)</span
                                    >{/if}
                            </p>
                            <p class="truncate font-body text-sm text-ink-muted">{account.email}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <Badge variant={roleBadge[account.role]}
                                >{ROLE_LABELS[account.role]}</Badge
                            >
                            <!-- Admins aren't changed from here, that also keeps you from demoting yourself -->
                            {#if account.role !== 'admin'}
                                {@const newRole =
                                    account.role === 'teacher' ? 'student' : 'teacher'}
                                <form
                                    method="POST"
                                    action="?/setRole"
                                    use:enhance={() => {
                                        pending = account.id;
                                        return async ({ update }) => {
                                            await update({ reset: false });
                                            pending = null;
                                        };
                                    }}
                                >
                                    <input type="hidden" name="userId" value={account.id} />
                                    <input type="hidden" name="role" value={newRole} />
                                    <button
                                        type="submit"
                                        disabled={pending === account.id}
                                        aria-label="Maak {account.userName} {newRole === 'teacher'
                                            ? 'docent'
                                            : 'student'}"
                                        class="px-3 py-1.5 font-display text-sm transition duration-150 disabled:cursor-wait disabled:opacity-60 {newRole ===
                                        'teacher'
                                            ? 'bg-accent text-white hover:bg-accent-hover'
                                            : 'border-2 border-border-soft text-ink-soft hover:border-accent hover:text-accent'}"
                                    >
                                        {newRole === 'teacher' ? 'Maak docent' : 'Maak student'}
                                    </button>
                                </form>
                            {/if}
                        </div>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

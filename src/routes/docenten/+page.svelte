<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageProps } from './$types';
    import Avatar from '$lib/components/Avatar.svelte';
    import Badge from '$lib/components/Badge.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';

    let { data, form }: PageProps = $props();

    let linkedCount = $derived(data.teachers.filter((teacher) => teacher.linked).length);
    // Id of the teacher whose form is being submitted, so only that button shows it's busy
    let pending: number | null = $state(null);
</script>

<svelte:head>
    <title>Docenten · Bookie</title>
</svelte:head>

<div class="min-h-full w-full bg-ivory px-4 py-6 md:py-8">
    <div class="mx-auto max-w-5xl">
        <PageHeader eyebrow="Docenten" title="Koppel je aan een docent"
            >{linkedCount} gekoppeld</PageHeader
        >

        <p class="mb-4 font-body text-ink-soft">
            Een docent waaraan je gekoppeld bent kan je leesprofiel en leeslijst inzien en boeken
            aan je leeslijst toevoegen.
        </p>

        <div aria-live="polite">
            {#if form?.message}
                <p
                    class="mb-4 rounded-md border-2 border-accent bg-surface px-4 py-2 font-body text-accent"
                >
                    {form.message}
                </p>
            {/if}
        </div>

        {#if data.teachers.length === 0}
            <EmptyState title="Er zijn nog geen docenten"
                >Kom later terug om je aan een docent te koppelen.</EmptyState
            >
        {:else}
            <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
                {#each data.teachers as teacher (teacher.id)}
                    <li
                        class="flex items-center justify-between gap-3 rounded-lg border-2 bg-surface p-4 {teacher.linked
                            ? 'border-accent'
                            : 'border-border'}"
                    >
                        <div class="flex min-w-0 items-center gap-3">
                            <Avatar name={teacher.userName} />
                            <div class="min-w-0">
                                <p class="truncate font-display font-bold text-ink">
                                    {teacher.userName}
                                </p>
                                {#if teacher.linked}
                                    <Badge variant="sage">Gekoppeld</Badge>
                                {/if}
                            </div>
                        </div>
                        <form
                            method="POST"
                            action={teacher.linked ? '?/unlink' : '?/link'}
                            use:enhance={() => {
                                pending = teacher.id;
                                return async ({ update }) => {
                                    await update();
                                    pending = null;
                                };
                            }}
                        >
                            <input type="hidden" name="teacherId" value={teacher.id} />
                            <button
                                type="submit"
                                disabled={pending === teacher.id}
                                class="px-4 py-2 font-display transition duration-150 disabled:cursor-wait disabled:opacity-60 {teacher.linked
                                    ? 'border-2 border-border-soft text-ink-soft hover:border-accent hover:text-accent'
                                    : 'bg-accent text-white hover:bg-accent-hover'}"
                            >
                                <!-- The name starts with the visible text, so voice control matches it (WCAG 2.5.3) -->
                                {teacher.linked ? 'Ontkoppelen' : 'Koppelen'}<span class="sr-only"
                                    >: {teacher.userName}</span
                                >
                            </button>
                        </form>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

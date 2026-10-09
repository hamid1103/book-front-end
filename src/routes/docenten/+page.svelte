<script lang="ts">
    import {enhance} from "$app/forms";
    import type {PageProps} from "./$types";
    import Avatar from "$lib/components/Avatar.svelte";
    import Badge from "$lib/components/Badge.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";

    let {data, form}: PageProps = $props();

    let linkedCount = $derived(data.teachers.filter(teacher => teacher.linked).length)
    // Id of the teacher whose form is being submitted, so only that button shows it's busy
    let pending: number | null = $state(null)
</script>

<div class="w-full min-h-full bg-ivory px-4 py-6 md:py-8">
    <div class="max-w-5xl mx-auto">
        <PageHeader eyebrow="Docenten" title="Koppel je aan een docent">{linkedCount} gekoppeld</PageHeader>

        <p class="font-body text-ink-soft mb-4">
            Een docent waaraan je gekoppeld bent kan je leesprofiel en leeslijst inzien en boeken aan je leeslijst toevoegen.
        </p>

        <div aria-live="polite">
            {#if form?.message}
                <p class="mb-4 rounded-md border-2 border-accent bg-surface px-4 py-2 font-body text-accent">{form.message}</p>
            {/if}
        </div>

        {#if data.teachers.length === 0}
            <EmptyState title="Er zijn nog geen docenten">Kom later terug om je aan een docent te koppelen.</EmptyState>
        {:else}
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each data.teachers as teacher (teacher.id)}
                    <li class="bg-surface border-2 rounded-lg p-4 flex items-center justify-between gap-3 {teacher.linked ? 'border-accent' : 'border-border'}">
                        <div class="flex items-center gap-3 min-w-0">
                            <Avatar name={teacher.userName}/>
                            <div class="min-w-0">
                                <p class="font-display font-bold text-ink truncate">{teacher.userName}</p>
                                {#if teacher.linked}
                                    <Badge variant="sage">Gekoppeld</Badge>
                                {/if}
                            </div>
                        </div>
                        <form method="POST" action={teacher.linked ? '?/unlink' : '?/link'}
                              use:enhance={() => {
                                  pending = teacher.id;
                                  return async ({update}) => {
                                      await update();
                                      pending = null;
                                  };
                              }}>
                            <input type="hidden" name="teacherId" value={teacher.id}/>
                            <button type="submit" disabled={pending === teacher.id}
                                    aria-label="{teacher.linked ? 'Ontkoppel van' : 'Koppel aan'} {teacher.userName}"
                                    class="font-display px-4 py-2 transition duration-150 disabled:opacity-60 disabled:cursor-wait {teacher.linked ? 'border-2 border-border-soft text-ink-soft hover:border-accent hover:text-accent' : 'bg-accent hover:bg-accent-hover text-white'}">
                                {teacher.linked ? 'Ontkoppelen' : 'Koppelen'}
                            </button>
                        </form>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

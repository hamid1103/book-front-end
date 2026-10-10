<script lang="ts">
    import type { PageProps } from './$types';
    import ReadingProfileSummary from '$lib/components/ReadingProfileSummary.svelte';
    import Avatar from '$lib/components/Avatar.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';

    let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>Mijn leerlingen · Bookie</title>
</svelte:head>

<div class="min-h-full w-full bg-ivory px-4 py-6 md:py-8">
    <div class="mx-auto max-w-5xl">
        <PageHeader eyebrow="Leerlingen" title="Jouw leerlingen"
            >{data.students.length} met leesprofiel</PageHeader
        >

        {#if data.students.length === 0}
            <EmptyState title="Nog geen leerlingen">
                Leerlingen koppelen zichzelf aan jou via de pagina "Docenten". Ze verschijnen hier
                zodra ze ook een leesprofiel hebben ingevuld.
            </EmptyState>
        {:else}
            <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
                {#each data.students as student (student.id)}
                    <li>
                        <a
                            href="/leerlingen/{student.id}"
                            class="group flex h-full flex-col gap-3 rounded-lg border-2 border-border bg-surface p-4 transition duration-150 hover:border-accent hover:shadow-md"
                        >
                            <div class="flex min-w-0 items-center gap-3">
                                <Avatar name={student.userName} />
                                <div class="min-w-0">
                                    <h2
                                        class="truncate font-display text-lg leading-tight font-bold text-ink transition group-hover:text-accent"
                                    >
                                        {student.userName}
                                    </h2>
                                    <p class="truncate font-body text-sm text-ink-muted">
                                        {student.email}
                                    </p>
                                </div>
                            </div>
                            <ReadingProfileSummary profile={student.readingProfile} />
                            <span class="mt-auto font-display text-sm text-accent"
                                >Bekijk leeslijst →</span
                            >
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

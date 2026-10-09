<script lang="ts">
    import type {PageProps} from "./$types";
    import ReadingProfileSummary from "$lib/components/ReadingProfileSummary.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";

    let {data}: PageProps = $props();
</script>

<div class="w-full min-h-full bg-ivory px-4 py-6 md:py-8">
    <div class="max-w-5xl mx-auto">
        <PageHeader eyebrow="Leerlingen" title="Jouw leerlingen">{data.students.length} met leesprofiel</PageHeader>

        {#if data.students.length === 0}
            <EmptyState title="Nog geen leerlingen">
                Leerlingen koppelen zichzelf aan jou via de pagina "Docenten". Ze verschijnen hier zodra ze ook een leesprofiel hebben ingevuld.
            </EmptyState>
        {:else}
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each data.students as student (student.id)}
                    <li>
                        <a href="/leerlingen/{student.id}" class="group h-full bg-surface border-2 border-border rounded-lg p-4 flex flex-col gap-3 hover:border-accent hover:shadow-md transition duration-150">
                            <div class="flex items-center gap-3 min-w-0">
                                <Avatar name={student.userName}/>
                                <div class="min-w-0">
                                    <h2 class="font-display font-bold text-ink text-lg leading-tight group-hover:text-accent transition truncate">{student.userName}</h2>
                                    <p class="text-sm font-body text-ink-muted truncate">{student.email}</p>
                                </div>
                            </div>
                            <ReadingProfileSummary profile={student.readingProfile}/>
                            <span class="mt-auto text-sm font-display text-accent">Bekijk leeslijst →</span>
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

<script lang="ts">
    import { LENGTH_LABELS, MOTIVATION_LABELS, type ReadingProfile } from '$lib/types';
    import Badge from '$lib/components/Badge.svelte';

    let { profile }: { profile: ReadingProfile | null } = $props();
</script>

{#if profile}
    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-body text-sm">
        <dt class="text-ink-muted">Niveau</dt>
        <dd class="text-ink-soft">{profile.languageLevel}</dd>
        <dt class="text-ink-muted">Doel</dt>
        <dd class="text-ink-soft">
            {MOTIVATION_LABELS[profile.ReadingMotivation] ?? profile.ReadingMotivation}
        </dd>
        <dt class="text-ink-muted">Lengte</dt>
        <dd class="text-ink-soft">{LENGTH_LABELS[profile.length] ?? profile.length}</dd>
        <dt class="text-ink-muted">Thema's</dt>
        <dd class="flex flex-wrap gap-1.5">
            {#each profile.genre ?? [] as theme (theme)}
                <Badge>#{theme}</Badge>
            {:else}
                <span class="text-ink-soft">-</span>
            {/each}
        </dd>
    </dl>
{:else}
    <p class="font-body text-sm text-ink-muted italic">Nog geen leesprofiel ingevuld.</p>
{/if}

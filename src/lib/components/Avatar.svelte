<script lang="ts">
    // Round avatar with the first letter of the name. Decorative, the name is always shown next to it
    let { name, color = 'bg-accent-blue' }: { name: string; color?: string } = $props();
</script>

<span
    aria-hidden="true"
    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold text-ivory {color}"
>
    {name[0]?.toUpperCase() ?? '?'}
</span>

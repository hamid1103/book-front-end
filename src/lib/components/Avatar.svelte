<script lang="ts">
    // Round avatar with the first letter of the name. Decorative, the name is always shown next to it
    let {name, color = 'bg-accent-blue'}: {name: string, color?: string} = $props();
</script>

<span aria-hidden="true" class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-ivory font-bold font-display {color}">
    {name[0]?.toUpperCase() ?? '?'}
</span>

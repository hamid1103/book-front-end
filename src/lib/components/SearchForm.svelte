<script lang="ts">
    // A plain GET form with a `q` field, so the search also works without JavaScript
    let {label, placeholder, value = '', buttonLabel = 'Zoek', class: className = ''}: {
        // Accessible name of the field
        label: string,
        placeholder: string,
        value?: string,
        buttonLabel?: string,
        class?: string,
    } = $props();
</script>

<form method="GET" role="search" class="flex gap-2 {className}" data-sveltekit-keepfocus data-sveltekit-noscroll>
    <label for="q" class="sr-only">{label}</label>
    <input id="q" name="q" type="search" {value} {placeholder}
           class="min-w-0 flex-1 rounded-md border-2 border-border-soft bg-ivory px-3 py-1.5 font-body text-sm focus:border-accent focus:ring-0"/>
    <button type="submit" class="bg-accent hover:bg-accent-hover text-white font-display px-3 py-1.5 text-sm transition duration-150 cursor-pointer">{buttonLabel}</button>
</form>

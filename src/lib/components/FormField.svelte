<script lang="ts">
    import type {HTMLInputAttributes} from "svelte/elements";

    // Label + input pair for the auth forms. Extra attributes (type, autocomplete, minlength, ...) go to the input
    let {id, label, hint, invalid = false, ...rest}: HTMLInputAttributes & {
        id: string,
        label: string,
        hint?: string,
        invalid?: boolean,
    } = $props();
</script>

<div class="flex flex-col gap-1">
    <label for={id} class="font-display font-bold text-sm text-ink">{label}</label>
    <input
        {id}
        name={id}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        class="w-full rounded-md border-2 bg-ivory px-3 py-2 font-body text-ink placeholder:text-ink-muted/70 transition-colors focus:ring-2 focus:ring-offset-0
               {invalid ? 'border-accent focus:border-accent focus:ring-accent/30' : 'border-border-soft focus:border-accent-sage focus:ring-accent-sage/30'}"
        {...rest}
    />
    {#if hint}
        <p id="{id}-hint" class="text-xs font-body text-ink-muted">{hint}</p>
    {/if}
</div>

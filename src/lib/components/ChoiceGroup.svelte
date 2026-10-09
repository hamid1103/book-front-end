<script lang="ts" module>
    export type Choice<V extends string = string> = {
        value: V;
        label: string;
        // Shown as a tooltip and read out by screen readers
        hint?: string;
        count?: number;
    };
</script>

<script lang="ts" generics="T extends string">
    // A <fieldset> of radio buttons or checkboxes styled as pills.
    // Radio groups bind a single value, checkbox groups an array of values

    let {
        legend,
        name,
        type,
        options,
        value = $bindable(),
        required = false,
        hideLegend = false,
        size = 'sm',
        class: className = ''
    }: {
        legend: string;
        name: string;
        type: 'radio' | 'checkbox';
        options: Choice<T>[];
        value: T | T[];
        required?: boolean;
        hideLegend?: boolean;
        size?: 'sm' | 'lg';
        class?: string;
    } = $props();

    const isChecked = (option: T) =>
        Array.isArray(value) ? value.includes(option) : value === option;

    function select(option: T, checked: boolean) {
        if (type === 'radio') value = option;
        else {
            const current = Array.isArray(value) ? value : [];
            value = checked ? [...current, option] : current.filter((v) => v !== option);
        }
    }
</script>

<fieldset class={className}>
    <!-- Floated, so the legend sits inside the fieldset's border like a normal heading -->
    <legend
        class={hideLegend
            ? 'sr-only'
            : `float-left w-full ${size === 'lg' ? 'mb-3 font-body text-accent md:text-2xl md:font-bold' : 'mb-2 font-display font-bold text-ink'}`}
    >
        {legend}{#if required}<span class="text-xl text-accent" aria-hidden="true">*</span>{/if}
    </legend>
    <div class="clear-both flex flex-wrap gap-2">
        {#each options as option (option.value)}
            <label
                title={option.hint}
                class="cursor-pointer rounded-full border-2 border-border-soft font-body text-ink-soft transition duration-150 select-none hover:border-accent has-checked:border-accent has-checked:bg-accent-brown has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-1
                          {size === 'lg' ? 'px-4 py-2 text-lg md:text-xl' : 'px-3 py-1 text-sm'}"
            >
                <input
                    class="sr-only"
                    {type}
                    {name}
                    value={option.value}
                    checked={isChecked(option.value)}
                    required={required && type === 'radio'}
                    onchange={(e) => select(option.value, e.currentTarget.checked)}
                />
                {option.label}
                {#if option.hint}<span class="sr-only">({option.hint})</span>{/if}
                {#if option.count !== undefined}<span class="opacity-75">({option.count})</span
                    >{/if}
            </label>
        {/each}
    </div>
</fieldset>

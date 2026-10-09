<script lang="ts">
    import { READING_STATUS_LABELS, type ReadingStatus } from '$lib/types';

    let {
        bookId,
        title,
        status,
        onChange
    }: {
        bookId: string;
        // Used in the group's accessible name, so screen readers know which book it belongs to
        title: string;
        status: ReadingStatus;
        onChange: (status: ReadingStatus) => void;
    } = $props();

    const options = (Object.entries(READING_STATUS_LABELS) as [ReadingStatus, string][]).map(
        ([value, label]) => ({ value, label })
    );
</script>

<fieldset class="mt-3">
    <legend class="sr-only">Leesstatus van {title}</legend>
    <div
        class="inline-flex flex-wrap overflow-hidden rounded-md border-2 border-border-soft font-body text-xs md:text-sm"
    >
        {#each options as option (option.value)}
            <label
                class="cursor-pointer px-2.5 py-1 text-ink-soft transition duration-150 select-none not-last:border-r-2 not-last:border-border-soft hover:bg-tan-bg has-checked:bg-sage-text has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-inset"
            >
                <input
                    class="sr-only"
                    type="radio"
                    name="status-{bookId}"
                    value={option.value}
                    checked={status === option.value}
                    onchange={() => onChange(option.value)}
                />
                {option.label}
            </label>
        {/each}
    </div>
</fieldset>

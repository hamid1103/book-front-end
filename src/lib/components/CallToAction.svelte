<script lang="ts">
    // Banner with a question and a link, stacks on small screens
    let { text, href, linkLabel }: { text: string; href: string; linkLabel: string } = $props();
</script>

<div
    class="flex w-full flex-col items-center justify-center gap-3 rounded-md border-4 border-accent bg-surface p-3 text-center sm:flex-row sm:gap-8 md:p-4"
>
    <span class="font-body text-xl font-bold text-ink md:text-2xl">{text}</span>
    <a
        {href}
        class="flex items-center rounded bg-accent p-2 font-display text-xl font-bold text-ivory transition duration-100 hover:bg-accent-hover"
    >
        <span>{linkLabel}</span>
        <img class="w-12 object-contain" src="/right-arrow.svg" alt="" />
    </a>
</div>

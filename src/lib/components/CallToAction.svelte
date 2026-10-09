<script lang="ts">
    // Banner with a question and a link, stacks on small screens
    let {text, href, linkLabel}: {text: string, href: string, linkLabel: string} = $props();
</script>

<div class="w-full p-3 md:p-4 bg-surface border-accent border-4 rounded-md flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center">
    <span class="text-xl md:text-2xl font-body font-bold text-ink">{text}</span>
    <a {href} class="flex items-center bg-accent transition duration-100 hover:bg-accent-hover p-2 text-xl font-bold font-display text-ivory rounded">
        <span>{linkLabel}</span>
        <img class="w-12 object-contain" src="/right-arrow.svg" alt=""/>
    </a>
</div>

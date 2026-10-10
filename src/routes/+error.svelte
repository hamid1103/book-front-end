<script lang="ts">
    import { page } from '$app/state';
    import ErrorState from '$lib/components/ErrorState.svelte';
</script>

<!-- Shown for every failed page (404, error() in a load, unexpected crashes), inside the normal layout -->
<div class="w-full bg-ivory px-4 py-10 md:py-16">
    <ErrorState status={page.status} message={page.error?.message} />
</div>

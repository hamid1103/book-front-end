<script lang="ts">
    import { page } from '$app/state';
</script>

<div class="min-h-full w-full bg-surface">
    <span>ERROR! {page.status} {page.error?.message}</span>
</div>

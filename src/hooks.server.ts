import type { Handle, HandleFetch } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('jwt');
    event.locals.user = null;

    if (token) {
        const res = await fetch(`${BACKEND_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) event.locals.user = await res.json();
        else event.cookies.delete('jwt', { path: '/' }); // expired or invalid
    }
    return resolve(event);
};

// Adds the token to API calls made with SvelteKit's fetch in load functions and actions
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    const token = event.cookies.get('jwt');
    if (token && request.url.startsWith(BACKEND_URL)) {
        request.headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(request);
};

import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('jwt');
    event.locals.user = null;

    if (token) {
        try {
            const res = await fetch(`${BACKEND_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) event.locals.user = await res.json();
            else event.cookies.delete('jwt', { path: '/' }); // expired or invalid
        } catch (err) {
            // Backend unreachable: continue logged out, so the page (or its error page) still renders
            console.error('Could not check the session with the backend', err);
        }
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

// Only runs for unexpected errors (not error() calls). Logs the details on the server, the page only
// gets SvelteKit's safe message ("Internal Error"), which ErrorState replaces with a Dutch explanation
export const handleError: HandleServerError = ({ error, event, status, message }) => {
    if (status !== 404)
        console.error(`${event.request.method} ${event.url.pathname} failed:`, error);
    return { message };
};

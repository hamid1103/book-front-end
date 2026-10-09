import { redirect, type Cookies } from '@sveltejs/kit';
import type { Role } from '$lib/types';

// Page guard: logged out users go to /login, users with another role back to the homepage.
// The backend checks the role too, this only keeps users away from pages they can't use
export function requireRole(locals: App.Locals, role: Role): App.User {
    if (!locals.user) redirect(307, '/login');
    if (locals.user.role !== role) redirect(303, '/');
    return locals.user;
}

// The backend returns {message} on errors, fall back to a generic text if the body isn't JSON
export async function backendMessage(res: Response, fallback: string): Promise<string> {
    try {
        const body = await res.json();
        return body.message ?? fallback;
    } catch {
        return fallback;
    }
}

// Stores the backend's JWT in the session cookie, used after logging in and registering
export function setSession(cookies: Cookies, token: string) {
    cookies.set('jwt', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24
    });
}

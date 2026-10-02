import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';

export const actions = {
    default: async ({ request, cookies, fetch }) => {
        const data = await request.formData();
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.get('email'), password: data.get('password') })
        });
        if (!res.ok) return fail(401, { error: 'Invalid credentials' });

        const { access_token } = await res.json();
        cookies.set('jwt', access_token, {
            path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24
        });
        throw redirect(303, '/');
    }
};
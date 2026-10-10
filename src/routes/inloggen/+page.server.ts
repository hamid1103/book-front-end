import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';
import { setSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(303, '/');
};

export const actions = {
    default: async ({ request, cookies, fetch }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString() ?? '';
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: data.get('password') })
        });
        if (!res.ok) return fail(401, { error: 'Onjuist e-mailadres of wachtwoord.', email });

        const { access_token } = await res.json();
        setSession(cookies, access_token);
        redirect(303, '/');
    }
} satisfies Actions;

import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';
import { backendMessage, setSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const MIN_PASSWORD_LENGTH = 8;

// The backend answers in English, these are the messages a user can act on
const BACKEND_ERRORS: Record<string, string> = {
    'Username already exists': 'Deze gebruikersnaam is al in gebruik.',
    'Email already exists': 'Er bestaat al een account met dit e-mailadres.'
};

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(303, '/');
};

export const actions = {
    default: async ({ request, cookies, fetch }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString().trim() ?? '';
        const email = data.get('email')?.toString().trim() ?? '';
        const password = data.get('password')?.toString() ?? '';
        const confirm = data.get('confirm')?.toString() ?? '';
        // Sent back so the form keeps what the user typed (never the passwords)
        const values = { username, email };

        if (!username || !email || !password) {
            return fail(400, { ...values, error: 'Vul alle velden in.' });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return fail(400, {
                ...values,
                error: `Je wachtwoord moet minstens ${MIN_PASSWORD_LENGTH} tekens lang zijn.`
            });
        }
        if (password !== confirm) {
            return fail(400, { ...values, error: 'De wachtwoorden komen niet overeen.' });
        }

        const res = await fetch(`${BACKEND_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) {
            const message = await backendMessage(res, '');
            return fail(res.status, {
                ...values,
                error:
                    BACKEND_ERRORS[message] ?? 'Registreren is mislukt, probeer het later opnieuw.'
            });
        }

        const { access_token } = await res.json();
        setSession(cookies, access_token);
        // New accounts start without a reading profile, which advice and teachers need (FR1, FR6)
        redirect(303, '/leesprofiel');
    }
} satisfies Actions;

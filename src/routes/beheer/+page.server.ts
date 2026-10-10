import { BACKEND_URL } from '$lib/server/api';
import { backendMessage, requireRole } from '$lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Account } from '$lib/types';

//Only these can be set from the panel, admins are still made with the assign:role script
const ASSIGNABLE = ['student', 'teacher'];

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    const admin = requireRole(locals, 'admin');
    const q = url.searchParams.get('q')?.trim() ?? '';

    const res = await fetch(`${BACKEND_URL}/users${q ? `?${new URLSearchParams({ q })}` : ''}`);
    if (!res.ok)
        error(res.status, await backendMessage(res, 'De accounts konden niet worden geladen.'));
    const accounts: Account[] = await res.json();
    return { accounts, q, adminId: Number(admin.id) };
};

export const actions = {
    setRole: async ({ request, fetch, locals }) => {
        requireRole(locals, 'admin');
        const data = await request.formData();
        const userId = Number(data.get('userId'));
        const role = data.get('role');
        if (
            !Number.isInteger(userId) ||
            userId < 1 ||
            typeof role !== 'string' ||
            !ASSIGNABLE.includes(role)
        ) {
            return fail(400, { message: 'Ongeldige gebruiker of rol.' });
        }

        const res = await fetch(`${BACKEND_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
        if (!res.ok)
            return fail(res.status, {
                message: await backendMessage(res, 'De rol kon niet worden aangepast.')
            });
        const updated: { userName: string; role: string } = await res.json();
        return {
            success: true,
            message: `${updated.userName} is nu ${updated.role === 'teacher' ? 'docent' : 'student'}.`
        };
    }
} satisfies Actions;

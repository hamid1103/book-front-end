import { BACKEND_URL } from '$lib/server/api';
import { backendMessage, requireRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Student } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    requireRole(locals, 'teacher');

    //The backend only returns linked students who filled in a reading profile (profileOnly defaults to true)
    const res = await fetch(`${BACKEND_URL}/students`);
    if (!res.ok)
        error(res.status, await backendMessage(res, 'De leerlingen konden niet worden geladen.'));
    const students: Student[] = await res.json();
    return { students };
};

import {BACKEND_URL} from "$lib/server/api";
import {backendMessage, requireRole} from "$lib/server/auth";
import {error, fail} from "@sveltejs/kit";
import type {Actions, PageServerLoad} from "./$types";
import type {Teacher} from "$lib/types";

export const load: PageServerLoad = async ({fetch, locals}) => {
    requireRole(locals, 'student');

    const res = await fetch(`${BACKEND_URL}/teachers`);
    if (!res.ok) error(res.status, await backendMessage(res, "De docenten konden niet worden geladen."));
    const teachers: Teacher[] = await res.json();
    return {teachers};
}

//Link and unlink only differ in the HTTP method
async function setLink(request: Request, fetch: typeof globalThis.fetch, method: 'POST' | 'DELETE') {
    const teacherId = Number((await request.formData()).get('teacherId'));
    if (!Number.isInteger(teacherId) || teacherId < 1) {
        return fail(400, {message: "Ongeldige docent."});
    }

    const res = await fetch(`${BACKEND_URL}/teachers/${teacherId}/link`, {method});
    if (!res.ok) {
        const fallback = method === 'POST' ? "Koppelen is mislukt." : "Ontkoppelen is mislukt.";
        return fail(res.status, {message: await backendMessage(res, fallback)});
    }
    return {success: true};
}

export const actions = {
    link: async ({request, fetch, locals}) => {
        requireRole(locals, 'student');
        return setLink(request, fetch, 'POST');
    },
    unlink: async ({request, fetch, locals}) => {
        requireRole(locals, 'student');
        return setLink(request, fetch, 'DELETE');
    },
} satisfies Actions;

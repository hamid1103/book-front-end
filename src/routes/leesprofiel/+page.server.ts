import type { Actions, PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/server/api';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    if (!locals.user) {
        throw redirect(307, '/login');
    }
    const tagsResponse = await fetch(`${BACKEND_URL}/books/genres`);
    if (!tagsResponse.ok) error(tagsResponse.status, tagsResponse.statusText);
    const tags: string[] = await tagsResponse.json();

    //No profile yet (404) or not logged in: the page shows an empty form and creates a new profile
    const readingListResponse = await fetch(`${BACKEND_URL}/reading-profile`);
    const readingList = readingListResponse.ok ? await readingListResponse.json() : null;

    return {
        tags,
        readingList
    };
};

//Create and update send the same body, only the HTTP method differs
async function saveProfile(
    request: Request,
    fetch: typeof globalThis.fetch,
    method: 'POST' | 'PUT'
) {
    const data = await request.formData();
    const profile = {
        languageLevel: data.get('languageLevel'),
        genre: data.getAll('genre'),
        length: data.get('length'),
        ReadingMotivation: data.get('ReadingMotivation')
    };

    if (!profile.languageLevel || !profile.length || !profile.ReadingMotivation) {
        return fail(400, { error: 'Vul alle verplichte velden in.' });
    }
    if (profile.genre.length === 0) {
        return fail(400, { error: 'Kies minstens één thema.' });
    }

    const req = await fetch(`${BACKEND_URL}/reading-profile`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    if (!req.ok) return fail(req.status, { error: 'Je leesprofiel kon niet worden opgeslagen.' });

    //Returning a plain object makes SvelteKit respond with 200, the page handles the redirect after showing a message
    return { success: true };
}

export const actions = {
    create: async ({ request, fetch }) => saveProfile(request, fetch, 'POST'),
    update: async ({ request, fetch }) => saveProfile(request, fetch, 'PUT')
} satisfies Actions;

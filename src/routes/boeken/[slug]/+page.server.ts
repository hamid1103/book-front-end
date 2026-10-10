import { error } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';
import type { PageServerLoad } from './$types';
import type { Book, ReadingList } from '$lib/types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    const req = await fetch(`${BACKEND_URL}/books/${params.slug}`);
    if (!req.ok) {
        error(req.status, req.statusText);
    }
    const book: Book = await req.json();

    // null for logged out users, so the page hides the reading list button
    let readingList: ReadingList | null = null;
    if (locals.user) {
        const readingListData = await fetch(`${BACKEND_URL}/readinglist?onlyId=true`);
        if (!readingListData.ok) {
            error(readingListData.status, readingListData.statusText);
        }
        readingList = await readingListData.json();
    }

    return {
        book,
        readingList
    };
};

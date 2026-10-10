import { BACKEND_URL } from '$lib/server/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Book, ReadingList } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    if (!locals.user) {
        redirect(307, '/inloggen');
    }

    const readingListData = await fetch(`${BACKEND_URL}/readinglist?onlyId=false`);
    if (!readingListData.ok) {
        console.log('reading list', readingListData.ok);
        error(readingListData.status, readingListData.statusText);
    }
    const rld: ReadingList<Book> = await readingListData.json();
    return {
        readingList: rld.book,
        readStatus: rld.status
    };
};

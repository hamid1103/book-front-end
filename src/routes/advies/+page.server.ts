import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { Book, ReadingList } from '$lib/types';

// The advice is streamed: the page (with skeletons) is sent right away and the books follow when the backend is done.
// It's personal advice, so there's nothing for search engines to miss here
export const load: PageServerLoad = async ({
    fetch,
    locals
}): Promise<{ advice: Promise<Book[]>; loggedIn: boolean; readingList: string[] | null }> => {
    const loggedIn: boolean = locals.user !== null;

    // Not awaited. error() can't be used once streaming has started, so a failure rejects and the page shows it
    const advice = fetch(`${BACKEND_URL}/advice?amount=4`).then(async (req): Promise<Book[]> => {
        if (!req.ok) {
            throw new Error(req.statusText);
        }
        return req.json();
    });

    // Only logged in users have a reading list, so only they get the heart
    let readingList: string[] | null = null;
    if (loggedIn) {
        const readingListData = await fetch(`${BACKEND_URL}/readinglist?onlyId=true`);
        if (!readingListData.ok) {
            error(readingListData.status, readingListData.statusText);
        }
        const rld: ReadingList = await readingListData.json();
        readingList = rld.book;
    }

    return { advice, loggedIn, readingList };
};

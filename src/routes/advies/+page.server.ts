import type {PageServerLoad} from "./$types";
import {BACKEND_URL} from "$lib/server/api";
import {error} from "@sveltejs/kit";
import type {Book, ReadingList} from "$lib/types";

export const load: PageServerLoad = async ({fetch, locals}): Promise<{books: Book[], loggedIn: boolean, readingList: string[] | null}> => {
    const loggedIn: boolean = locals.user !== null

    const req = await fetch(`${BACKEND_URL}/advice?amount=4`);
    if (!req.ok) {
        error(req.status, req.statusText);
    }
    const books: Book[] = await req.json();

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

    return {books: books, loggedIn, readingList};
}

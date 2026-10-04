import type {PageServerLoad} from "./$types";
import {BACKEND_URL} from "$lib/server/api";
import {error} from "@sveltejs/kit";
import type {Book} from "$lib/types";

export const load: PageServerLoad = async ({fetch, locals}): Promise<{books: Book[], loggedIn: boolean}> => {
    const loggedIn: boolean = locals.user !== null

    const req = await fetch(`${BACKEND_URL}/advice?amount=4`);
    if (!req.ok) {
        error(req.status, req.statusText);
    }
    const books: Book[] = await req.json();

    return {books: books, loggedIn};
}
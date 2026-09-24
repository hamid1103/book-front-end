import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {

    const req = await fetch("http://localhost:3000/books");
    if(req.status > 400 || req.status > 500) {
        return {
            error: req.statusText,
            code: req.status,
        }
    }
    const books: [{
        "_id": string,
        "title": string,
        "author": string
    }] = await req.json();
    return {
        books: books
    };
};
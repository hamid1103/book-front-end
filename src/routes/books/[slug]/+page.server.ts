import type { PageServerLoad } from "../../../../.svelte-kit/types/src/routes/books/[slug]/$types";

export const load: PageServerLoad = async ({params})=>{
    const req = await fetch(`http://localhost:3000/books/${params.slug}`);
    if(req.status > 400 || req.status > 500) {
        return {
            error: req.statusText,
            code: req.status,
        }
    }
    const book: {
        "_id": string,
        "title": string,
        "author": string,
        "genre": [string],
        "description": string,
        "readingLevel": [string],
        "tags": [string]
        "materialType": string,
    } = await req.json();
    return {
        book: book
    };
}
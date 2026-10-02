import { error } from "@sveltejs/kit";
import { BACKEND_URL } from "$lib/server/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({params, fetch})=>{
    const req = await fetch(`${BACKEND_URL}/books/${params.slug}`);
    if(!req.ok) {
        error(req.status, req.statusText);
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
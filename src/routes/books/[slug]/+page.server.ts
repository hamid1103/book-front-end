import { error } from "@sveltejs/kit";
import { BACKEND_URL } from "$lib/server/api";
import type { PageServerLoad } from "./$types";
import type { Book } from "$lib/types";

export const load: PageServerLoad = async ({params, fetch})=>{
    const req = await fetch(`${BACKEND_URL}/books/${params.slug}`);
    if(!req.ok) {
        error(req.status, req.statusText);
    }
    const book: Book = await req.json();
    return {
        book: book
    };
}
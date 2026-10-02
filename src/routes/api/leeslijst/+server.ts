import {json, type RequestHandler} from "@sveltejs/kit";
import {BACKEND_URL} from "$lib/server/api";

// Use SvelteKit's fetch so handleFetch adds the Authorization header
export const POST : RequestHandler = async ({request, fetch}) => {
    const {bookId, shouldDelete, onlyId} = await request.json();
    const rlReq = {
        onlyId,
        book: bookId
    }
    console.log(JSON.stringify(rlReq))
    const req = await fetch(`${BACKEND_URL}/readinglist`, {
        method: shouldDelete ? "DELETE" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(rlReq)
    });
    if(!req.ok)
    {
        console.log(req.status, req.statusText)
    }

    const response = await req.json()

    // Pass the backend's status through so the client's `ok` check works
    return json(response, {status: req.status})
}
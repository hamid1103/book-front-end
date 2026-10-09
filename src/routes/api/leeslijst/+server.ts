import { json, type RequestHandler } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';

// Use SvelteKit's fetch so handleFetch adds the Authorization header
async function forward(fetch: typeof globalThis.fetch, method: string, body: object) {
    const req = await fetch(`${BACKEND_URL}/readinglist`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!req.ok) {
        console.log(req.status, req.statusText);
    }

    const response = await req.json();

    // Pass the backend's status through so the client's `ok` check works
    return json(response, { status: req.status });
}

export const POST: RequestHandler = async ({ request, fetch }) => {
    const { bookId, shouldDelete, onlyId } = await request.json();
    return forward(fetch, shouldDelete ? 'DELETE' : 'POST', { onlyId, book: bookId });
};

// Sets the reading status, the backend also adds the book to the list if it isn't on it yet
export const PATCH: RequestHandler = async ({ request, fetch }) => {
    const { bookId, status, onlyId } = await request.json();
    return forward(fetch, 'PATCH', { onlyId, book: bookId, status });
};

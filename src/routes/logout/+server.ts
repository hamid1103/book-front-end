import type { RequestHandler } from '@sveltejs/kit';

// The jwt cookie is httpOnly, so the browser can't delete it itself and calls this instead
export const POST: RequestHandler = async ({ cookies }) => {
    cookies.delete('jwt', { path: '/' });
    return new Response(null, { status: 204 });
};

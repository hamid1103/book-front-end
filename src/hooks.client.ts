import type { HandleClientError } from '@sveltejs/kit';

// Same as the server version, for unexpected errors during client-side navigation
export const handleError: HandleClientError = ({ error, status, message }) => {
    if (status !== 404) console.error(error);
    return { message };
};

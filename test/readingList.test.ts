import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearNotice, notice } from '$lib/notice.svelte';
import { setReadingStatus, toggleReadingListEntry } from '$lib/readingList';

const respond = (status: number, body: object = {}) =>
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('readingList', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        clearNotice();
    });

    it('returns the list and shows no message when the request works', async () => {
        vi.stubGlobal('fetch', respond(200, { book: ['abc123'], status: {} }));
        expect(await toggleReadingListEntry('abc123', false)).toEqual({
            book: ['abc123'],
            status: {}
        });
        expect(notice.message).toBeNull();
    });

    it('shows a message when the server fails', async () => {
        vi.stubGlobal('fetch', respond(500));
        expect(await setReadingStatus('abc123', 'Read')).toBeNull();
        expect(notice.message).toMatch(/kon niet worden bijgewerkt/);
    });

    it('asks to log in again when the session is gone', async () => {
        vi.stubGlobal('fetch', respond(401));
        expect(await toggleReadingListEntry('abc123', false)).toBeNull();
        expect(notice.message).toMatch(/Log opnieuw in/);
    });

    it('shows a message when there is no connection', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
        expect(await toggleReadingListEntry('abc123', false)).toBeNull();
        expect(notice.message).toMatch(/Geen verbinding/);
    });
});

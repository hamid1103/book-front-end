import type { Book, ReadingList, ReadingStatus } from '$lib/types';
import { showNotice } from '$lib/notice.svelte';

// Client-side helpers for the /api/leeslijst proxy. They return null when the request failed,
// so callers can keep their current state. The error message is shown by the layout

async function send<T>(method: 'POST' | 'PATCH', body: object): Promise<T | null> {
    try {
        const res = await fetch('/api/leeslijst', { method, body: JSON.stringify(body) });
        if (res.ok) return await res.json();
        showNotice(
            res.status === 401
                ? 'Je bent niet meer ingelogd. Log opnieuw in om je leeslijst aan te passen.'
                : 'Je leeslijst kon niet worden bijgewerkt. Probeer het later opnieuw.'
        );
    } catch {
        // fetch throws when there is no connection
        showNotice('Geen verbinding. Controleer je internet en probeer het opnieuw.');
    }
    return null;
}

export function toggleReadingListEntry(
    bookId: string,
    shouldDelete: boolean
): Promise<ReadingList | null> {
    return send('POST', { bookId, onlyId: true, shouldDelete });
}

export function removeFromReadingList(bookId: string): Promise<ReadingList<Book> | null> {
    return send('POST', { bookId, onlyId: false, shouldDelete: true });
}

export function setReadingStatus(
    bookId: string,
    status: ReadingStatus
): Promise<ReadingList | null> {
    return send('PATCH', { bookId, status, onlyId: true });
}

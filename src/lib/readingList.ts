import type {Book, ReadingList, ReadingStatus} from "$lib/types";

// Client-side helpers for the /api/leeslijst proxy. They return null when the request failed,
// so callers can keep their current state

export async function toggleReadingListEntry(bookId: string, shouldDelete: boolean): Promise<ReadingList | null> {
    const res = await fetch("/api/leeslijst", {
        method: "POST",
        body: JSON.stringify({bookId, onlyId: true, shouldDelete}),
    });
    return res.ok ? await res.json() : null;
}

export async function removeFromReadingList(bookId: string): Promise<ReadingList<Book> | null> {
    const res = await fetch("/api/leeslijst", {
        method: "POST",
        body: JSON.stringify({bookId, onlyId: false, shouldDelete: true}),
    });
    return res.ok ? await res.json() : null;
}

export async function setReadingStatus(bookId: string, status: ReadingStatus): Promise<ReadingList | null> {
    const res = await fetch("/api/leeslijst", {
        method: "PATCH",
        body: JSON.stringify({bookId, status, onlyId: true}),
    });
    return res.ok ? await res.json() : null;
}

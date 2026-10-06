export type Book = {
    _id: string,
    title: string,
    author: string,
    genre: string[],
    description: string,
    readingLevel: string[],
    tags: string[],
    materialType: string,
    imageUrl?: string,
    sourceUrl?: string,
    // Only set on books coming from /advice
    motivation?: string,
}

export type ReadingStatus = 'NotRead' | 'Reading' | 'Read'

// Response of the backend /readinglist routes. `book` holds ids when onlyId=true, full books otherwise
export type ReadingList<T extends string | Book = string> = {
    userID: string,
    book: T[],
    // Book id -> status, every book on the list has an entry
    status: Record<string, ReadingStatus>,
}

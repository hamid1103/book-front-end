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

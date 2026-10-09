import {createRawSnippet} from 'svelte';
import type {Book} from '$lib/types';

// Turns plain text into a snippet, for components that take children
export const text = (value: string) => createRawSnippet(() => ({render: () => `<span>${value}</span>`}));

export const book: Book = {
    _id: 'abc123',
    title: 'De Avonden',
    author: 'Gerard Reve',
    genre: ['Roman'],
    description: 'Een week uit het leven van Frits van Egters.',
    readingLevel: ['B2'],
    tags: ['klassieker'],
    materialType: 'Boek',
};

import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import BookCover from '$lib/components/BookCover.svelte';
import {book} from '../helpers';

describe('BookCover', () => {
    it('links to the book page and shows title and author', () => {
        render(BookCover, {book});
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/books/abc123');
        expect(link).toHaveTextContent('De Avonden');
        expect(link).toHaveTextContent('Gerard Reve');
    });

    it('gives the same book the same colour every time', () => {
        const first = render(BookCover, {book}).container.querySelector('a')!.className;
        const second = render(BookCover, {book}).container.querySelector('a')!.className;
        expect(first).toBe(second);
    });
});

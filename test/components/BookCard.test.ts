import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BookCard from '$lib/components/BookCard.svelte';
import { book } from '../helpers';

describe('BookCard', () => {
    it('shows the book details', () => {
        render(BookCard, { book });
        expect(screen.getByRole('heading', { name: 'De Avonden' })).toBeInTheDocument();
        expect(screen.getByText(book.description)).toBeInTheDocument();
    });

    it('hides the heart without onToggle', () => {
        render(BookCard, { book });
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows the heart and calls onToggle when clicked', async () => {
        const onToggle = vi.fn();
        render(BookCard, { book, onToggle });
        await userEvent.click(
            screen.getByRole('button', { name: 'Voeg De Avonden toe aan leeslijst' })
        );
        expect(onToggle).toHaveBeenCalledOnce();
    });

    it('labels the heart as remove when the book is on the reading list', () => {
        render(BookCard, { book, inReadingList: true, onToggle: () => {} });
        expect(
            screen.getByRole('button', { name: 'Verwijder De Avonden van leeslijst' })
        ).toBeInTheDocument();
    });

    it('shows the motivation when there is one', () => {
        render(BookCard, { book: { ...book, motivation: 'Past bij je niveau' } });
        expect(screen.getByText('Waarom dit bij jou past')).toBeInTheDocument();
        expect(screen.getByText('Past bij je niveau')).toBeInTheDocument();
    });
});

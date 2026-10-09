import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BookTags from '$lib/components/BookTags.svelte';
import { book } from '../helpers';

describe('BookTags', () => {
    it('shows reading levels, genres and tags', () => {
        render(BookTags, { book });
        expect(screen.getByText('B2')).toBeInTheDocument();
        expect(screen.getByText('Roman')).toBeInTheDocument();
        expect(screen.getByText('#klassieker')).toBeInTheDocument();
    });
});

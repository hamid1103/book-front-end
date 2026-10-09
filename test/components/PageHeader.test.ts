import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import PageHeader from '$lib/components/PageHeader.svelte';
import {text} from '../helpers';

describe('PageHeader', () => {
    it('shows eyebrow, title and subtitle', () => {
        render(PageHeader, {eyebrow: 'Mijn', title: 'Leeslijst', subtitle: 'Je boeken'});
        expect(screen.getByText('Mijn')).toBeInTheDocument();
        expect(screen.getByRole('heading', {level: 1, name: 'Leeslijst'})).toBeInTheDocument();
        expect(screen.getByText('Je boeken')).toBeInTheDocument();
    });

    it('renders children on the right', () => {
        render(PageHeader, {eyebrow: 'Mijn', title: 'Leeslijst', children: text('3 van 5 gelezen')});
        expect(screen.getByText('3 van 5 gelezen')).toBeInTheDocument();
    });
});

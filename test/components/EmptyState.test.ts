import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import EmptyState from '$lib/components/EmptyState.svelte';
import {text} from '../helpers';

describe('EmptyState', () => {
    it('shows the title and explanation', () => {
        render(EmptyState, {title: 'Geen boeken', children: text('Voeg een boek toe.')});
        expect(screen.getByRole('heading', {name: 'Geen boeken'})).toBeInTheDocument();
        expect(screen.getByText('Voeg een boek toe.')).toBeInTheDocument();
    });

    it('shows the action when given', () => {
        render(EmptyState, {title: 'Leeg', children: text('Niks'), action: text('Zoek boeken')});
        expect(screen.getByText('Zoek boeken')).toBeInTheDocument();
    });
});

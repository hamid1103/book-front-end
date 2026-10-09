import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Heart from '$lib/components/Heart.svelte';

describe('Heart', () => {
    it('uses the label as accessible name', () => {
        render(Heart, { filled: false, action: () => {}, label: 'Voeg toe aan leeslijst' });
        expect(screen.getByRole('button', { name: 'Voeg toe aan leeslijst' })).toBeInTheDocument();
    });

    it('shows whether it is pressed', () => {
        render(Heart, { filled: true, action: () => {}, label: 'Heart' });
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls action when clicked', async () => {
        const action = vi.fn();
        render(Heart, { filled: false, action, label: 'Heart' });
        await userEvent.click(screen.getByRole('button'));
        expect(action).toHaveBeenCalledOnce();
    });
});

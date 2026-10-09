import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ReadingStatusPicker from '$lib/components/ReadingStatusPicker.svelte';

describe('ReadingStatusPicker', () => {
    it('checks the current status', () => {
        render(ReadingStatusPicker, {
            bookId: '1',
            title: 'De Avonden',
            status: 'Reading',
            onChange: () => {}
        });
        expect(
            screen.getByRole('group', { name: 'Leesstatus van De Avonden' })
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Bezig' })).toBeChecked();
    });

    it('calls onChange with the new status', async () => {
        const onChange = vi.fn();
        render(ReadingStatusPicker, {
            bookId: '1',
            title: 'De Avonden',
            status: 'NotRead',
            onChange
        });
        await userEvent.click(screen.getByRole('radio', { name: 'Gelezen' }));
        expect(onChange).toHaveBeenCalledWith('Read');
    });
});

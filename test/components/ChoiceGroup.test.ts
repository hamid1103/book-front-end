import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ChoiceGroup from '$lib/components/ChoiceGroup.svelte';

const options = [
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1', count: 4 }
];

describe('ChoiceGroup', () => {
    it('renders a radio for every option and checks the current value', () => {
        render(ChoiceGroup, {
            legend: 'Niveau',
            name: 'level',
            type: 'radio',
            options,
            value: 'B1'
        });
        expect(screen.getByRole('group', { name: 'Niveau' })).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(2);
        expect(screen.getByRole('radio', { name: /B1/ })).toBeChecked();
    });

    it('tells screen readers a required group is required', () => {
        render(ChoiceGroup, {
            legend: 'Niveau',
            name: 'level',
            type: 'radio',
            options,
            value: 'A2',
            required: true
        });
        expect(screen.getByRole('group', { name: 'Niveau(verplicht)' })).toBeInTheDocument();
    });

    it('shows the count', () => {
        render(ChoiceGroup, {
            legend: 'Niveau',
            name: 'level',
            type: 'radio',
            options,
            value: 'A2'
        });
        expect(screen.getByText('(4)')).toBeInTheDocument();
    });

    it('selects another radio when clicked', async () => {
        render(ChoiceGroup, {
            legend: 'Niveau',
            name: 'level',
            type: 'radio',
            options,
            value: 'A2'
        });
        await userEvent.click(screen.getByRole('radio', { name: /B1/ }));
        expect(screen.getByRole('radio', { name: /B1/ })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'A2' })).not.toBeChecked();
    });

    it('allows multiple checkboxes to be checked', async () => {
        render(ChoiceGroup, {
            legend: 'Niveau',
            name: 'level',
            type: 'checkbox',
            options,
            value: []
        });
        await userEvent.click(screen.getByRole('checkbox', { name: 'A2' }));
        await userEvent.click(screen.getByRole('checkbox', { name: /B1/ }));
        expect(screen.getByRole('checkbox', { name: 'A2' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: /B1/ })).toBeChecked();
    });
});

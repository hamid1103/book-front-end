import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import FormField from '$lib/components/FormField.svelte';

describe('FormField', () => {
    it('links the label to the input', () => {
        render(FormField, {id: 'email', label: 'E-mail', type: 'email'});
        const input = screen.getByLabelText('E-mail');
        expect(input).toHaveAttribute('name', 'email');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('describes the input with the hint', () => {
        render(FormField, {id: 'password', label: 'Wachtwoord', hint: 'Minimaal 8 tekens'});
        expect(screen.getByLabelText('Wachtwoord')).toHaveAccessibleDescription('Minimaal 8 tekens');
    });

    it('marks the input as invalid', () => {
        render(FormField, {id: 'email', label: 'E-mail', invalid: true});
        expect(screen.getByLabelText('E-mail')).toBeInvalid();
    });
});

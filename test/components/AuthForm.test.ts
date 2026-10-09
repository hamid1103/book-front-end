import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AuthForm from '$lib/components/AuthForm.svelte';
import { text } from '../helpers';

// enhance only works inside a SvelteKit app, so replace it with a no-op action
vi.mock('$app/forms', () => ({ enhance: () => ({}) }));

const props = {
    title: 'Inloggen',
    subtitle: 'Welkom terug',
    errorTitle: 'Inloggen mislukt',
    submitLabel: 'Log in',
    children: text('velden'),
    footer: text('Nog geen account?')
};

describe('AuthForm', () => {
    it('shows the title, fields, submit button and footer', () => {
        render(AuthForm, props);
        expect(screen.getByRole('heading', { name: 'Inloggen' })).toBeInTheDocument();
        expect(screen.getByText('velden')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
        expect(screen.getByText('Nog geen account?')).toBeInTheDocument();
    });

    it('shows no alert without an error', () => {
        render(AuthForm, props);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the error in an alert', () => {
        render(AuthForm, { ...props, error: 'Verkeerd wachtwoord' });
        expect(screen.getByRole('alert')).toHaveTextContent('Verkeerd wachtwoord');
    });
});

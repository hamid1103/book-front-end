import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ErrorState from '$lib/components/ErrorState.svelte';

describe('ErrorState', () => {
    it('explains a 404 in Dutch and links home', () => {
        render(ErrorState, { status: 404, message: 'Not Found' });
        expect(screen.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Naar de homepage' })).toHaveAttribute('href', '/');
        // The English status text from the backend is hidden
        expect(screen.queryByText('Not Found')).not.toBeInTheDocument();
    });

    it('shows a specific message from the server', () => {
        render(ErrorState, {
            status: 404,
            message: 'Leerling niet gevonden of niet aan jou gekoppeld'
        });
        expect(
            screen.getByText('Leerling niet gevonden of niet aan jou gekoppeld')
        ).toBeInTheDocument();
    });

    it('offers a login link for 401', () => {
        render(ErrorState, { status: 401 });
        expect(screen.getByRole('link', { name: 'Inloggen' })).toHaveAttribute('href', '/inloggen');
    });

    it('offers a retry for server errors and falls back to a generic text', () => {
        render(ErrorState, { status: 503, message: 'Internal Error' });
        expect(screen.getByRole('heading', { name: 'Er ging iets mis' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Probeer opnieuw' })).toBeInTheDocument();
        expect(screen.queryByText('Internal Error')).not.toBeInTheDocument();
    });

    it('has no retry button for client errors', () => {
        render(ErrorState, { status: 403 });
        expect(screen.getByRole('heading', { name: 'Geen toegang' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Probeer opnieuw' })).not.toBeInTheDocument();
    });
});

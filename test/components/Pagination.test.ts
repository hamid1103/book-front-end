import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Pagination from '$lib/components/Pagination.svelte';

describe('Pagination', () => {
    it('shows the result range', () => {
        render(Pagination, {page: 2, limit: 10, total: 25, onNavigate: () => {}});
        expect(screen.getByText('Resultaten 11-20 van de 25')).toBeInTheDocument();
    });

    it('disables previous buttons on the first page', () => {
        render(Pagination, {page: 1, limit: 10, total: 25, onNavigate: () => {}});
        expect(screen.getByRole('button', {name: 'Eerste pagina'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Vorige pagina'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Volgende pagina'})).toBeEnabled();
    });

    it('disables next buttons on the last page', () => {
        render(Pagination, {page: 3, limit: 10, total: 25, onNavigate: () => {}});
        expect(screen.getByRole('button', {name: 'Volgende pagina'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Laatste pagina'})).toBeDisabled();
    });

    it('navigates to the right page', async () => {
        const onNavigate = vi.fn();
        render(Pagination, {page: 2, limit: 10, total: 25, onNavigate});
        await userEvent.click(screen.getByRole('button', {name: 'Volgende pagina'}));
        await userEvent.click(screen.getByRole('button', {name: 'Laatste pagina'}));
        expect(onNavigate).toHaveBeenNthCalledWith(1, 3);
        expect(onNavigate).toHaveBeenNthCalledWith(2, 3);
    });

    it('shows 0-0 when there are no results', () => {
        render(Pagination, {page: 1, limit: 10, total: 0, onNavigate: () => {}});
        expect(screen.getByText('Resultaten 0-0 van de 0')).toBeInTheDocument();
    });
});

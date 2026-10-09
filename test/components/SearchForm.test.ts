import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import SearchForm from '$lib/components/SearchForm.svelte';

describe('SearchForm', () => {
    it('renders a search field with the given value', () => {
        render(SearchForm, {label: 'Zoek boeken', placeholder: 'Titel...', value: 'reve'});
        const input = screen.getByRole('searchbox', {name: 'Zoek boeken'});
        expect(input).toHaveAttribute('name', 'q');
        expect(input).toHaveValue('reve');
    });

    it('uses the default button label', () => {
        render(SearchForm, {label: 'Zoek', placeholder: ''});
        expect(screen.getByRole('button', {name: 'Zoek'})).toHaveAttribute('type', 'submit');
    });
});

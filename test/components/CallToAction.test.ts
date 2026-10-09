import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import CallToAction from '$lib/components/CallToAction.svelte';

describe('CallToAction', () => {
    it('shows the text and the link', () => {
        render(CallToAction, {text: 'Wil je advies?', href: '/advies', linkLabel: 'Naar advies'});
        expect(screen.getByText('Wil je advies?')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Naar advies'})).toHaveAttribute('href', '/advies');
    });
});

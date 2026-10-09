import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import Badge from '$lib/components/Badge.svelte';
import {text} from '../helpers';

describe('Badge', () => {
    it('renders its children', () => {
        render(Badge, {children: text('Gelezen')});
        expect(screen.getByText('Gelezen')).toBeInTheDocument();
    });

    it('applies the variant styles', () => {
        render(Badge, {variant: 'sage', children: text('Roman')});
        expect(screen.getByText('Roman').parentElement).toHaveClass('bg-sage-bg');
    });
});

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/svelte';
import Avatar from '$lib/components/Avatar.svelte';

describe('Avatar', () => {
    it('shows the first letter in uppercase', () => {
        const {container} = render(Avatar, {name: 'corvo'});
        expect(container).toHaveTextContent('C');
    });

    it('shows a question mark for an empty name', () => {
        const {container} = render(Avatar, {name: ''});
        expect(container).toHaveTextContent('?');
    });
});

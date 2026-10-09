import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/svelte';
import ReadingProfileSummary from '$lib/components/ReadingProfileSummary.svelte';

describe('ReadingProfileSummary', () => {
    it('shows a message without a profile', () => {
        render(ReadingProfileSummary, {profile: null});
        expect(screen.getByText('Nog geen leesprofiel ingevuld.')).toBeInTheDocument();
    });

    it('shows the profile with Dutch labels', () => {
        render(ReadingProfileSummary, {
            profile: {languageLevel: 'B1', ReadingMotivation: 'ForPleasure', length: 'Short', genre: ['fantasy']},
        });
        expect(screen.getByText('B1')).toBeInTheDocument();
        expect(screen.getByText('Voor de lol')).toBeInTheDocument();
        expect(screen.getByText('Kort')).toBeInTheDocument();
        expect(screen.getByText('#fantasy')).toBeInTheDocument();
    });

    it('shows a dash without themes', () => {
        render(ReadingProfileSummary, {
            profile: {languageLevel: 'A2', ReadingMotivation: 'ForSchool', length: 'Long', genre: []},
        });
        expect(screen.getByText('-')).toBeInTheDocument();
    });
});

import { BACKEND_URL } from '$lib/server/api';
import type { PageServerLoad } from './$types';
import type { Book } from '$lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
    const advice = await fetch(BACKEND_URL + '/advice?amount=3');
    const adviceData: Book[] = advice.ok ? await advice.json() : [];
    return {
        advice: adviceData
    };
};

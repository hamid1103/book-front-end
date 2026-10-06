import {error} from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';
import type { PageServerLoad } from './$types';

//There is no length in the data, so the material type stands in for it (same mapping as the backend AdviceService)
const LENGTH_MAP: Record<string, string[]> = {
    Short: ['OnlineArticle', 'NewspaperArticle', 'BlogPost'],
    Medium: ['Magazine', 'PoetryBundle'],
    Long: ['Book'],
};

const LEVELS = ['2F', '3F', '3F+'];

export const load: PageServerLoad = async ({ url, fetch, locals }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    //Only pass on known values, so a hand-edited URL can't make the backend schema reject the request
    const filters = {
        q: url.searchParams.get('q')?.trim() ?? '',
        level: url.searchParams.getAll('level').filter(level => LEVELS.includes(level)),
        length: url.searchParams.getAll('length').filter(length => length in LENGTH_MAP),
        tags: url.searchParams.getAll('tags'),
    };

    const query = new URLSearchParams({qpage: String(page), qlimit: String(limit)});
    if (filters.q) query.set('title', filters.q);
    filters.level.forEach(level => query.append('readingLevel', level));
    filters.length.flatMap(length => LENGTH_MAP[length]).forEach(type => query.append('materialType', type));
    filters.tags.forEach(tag => query.append('tags', tag));

    const [req, tagsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/books?${query}`),
        fetch(`${BACKEND_URL}/books/genres`),
    ]);
    if (!req.ok) {
        error(req.status, req.statusText);
    }
    if (!tagsResponse.ok) {
        error(tagsResponse.status, tagsResponse.statusText);
    }
    const {books, meta} = await req.json();
    const tags: string[] = await tagsResponse.json();

    const data = {
        books,
        meta,
        tags,
        filters,
        readingList: null as string[] | null
    }

    if(locals.user){
        const readingListData = await fetch(`${BACKEND_URL}/readinglist?onlyId=true`)
        if(!readingListData.ok)
        {
            error(readingListData.status, readingListData.statusText);
        }
        const rld = await readingListData.json();
        data.readingList = rld.book;
    }

    return data;
}

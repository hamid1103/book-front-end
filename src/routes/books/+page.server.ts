import {error, fail, redirect} from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, locals }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const req = await fetch(`${BACKEND_URL}/books?qpage=${page}&qlimit=${limit}`);
    if (!req.ok) {
        error(req.status, req.statusText);
    }
    const {books, meta} = await req.json();

    const data = {
        books,
        meta,
        readingList: null
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
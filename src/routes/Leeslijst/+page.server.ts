import {BACKEND_URL} from "$lib/server/api";
import {error, redirect} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";

export const load: PageServerLoad = async ({fetch, locals})=>{
    if(!locals.user)
    {
        redirect(307, "/login")
    }

    const readingListData = await fetch(`${BACKEND_URL}/readinglist?onlyId=false`)
    if(!readingListData.ok)
    {
        console.log("reading list", readingListData.ok);
        error(readingListData.status, readingListData.statusText);
    }
    const rld = await readingListData.json();
    return {
        readingList: rld.book
    };
}
import {BACKEND_URL} from "$lib/server/api";
import type {PageServerLoad} from "./$types";

export const load : PageServerLoad = async ({fetch, locals}) => {
    const advice = await fetch(BACKEND_URL+"/advice?amount=3");
    const adviceData = await advice.json();
    return {
        advice: adviceData
    }
}
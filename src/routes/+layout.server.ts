import type {LayoutServerLoad} from "./$types";

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
    return {
        user: locals.user,
    }
}
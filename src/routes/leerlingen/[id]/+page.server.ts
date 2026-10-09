import { BACKEND_URL } from '$lib/server/api';
import { backendMessage, requireRole } from '$lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Book, ReadingList, Student } from '$lib/types';

const SEARCH_LIMIT = 10;

function studentId(param: string): number {
    const id = Number(param);
    if (!Number.isInteger(id) || id < 1) error(404, 'Leerling niet gevonden');
    return id;
}

export const load: PageServerLoad = async ({ fetch, locals, params, url }) => {
    requireRole(locals, 'teacher');
    const id = studentId(params.id);
    const q = url.searchParams.get('q')?.trim() ?? '';

    //There's no single-student endpoint, so the student is picked out of all linked students (also the ones without a profile)
    const [studentsRes, listRes, searchRes] = await Promise.all([
        fetch(`${BACKEND_URL}/students?profileOnly=false`),
        fetch(`${BACKEND_URL}/students/${id}/readinglist?onlyId=false`),
        q
            ? fetch(
                  `${BACKEND_URL}/books?${new URLSearchParams({ title: q, qpage: '1', qlimit: String(SEARCH_LIMIT) })}`
              )
            : null
    ]);

    //The backend answers 404 for students that aren't linked to this teacher
    if (listRes.status === 404) error(404, 'Leerling niet gevonden of niet aan jou gekoppeld');
    if (!listRes.ok)
        error(
            listRes.status,
            await backendMessage(listRes, 'De leeslijst kon niet worden geladen.')
        );
    if (!studentsRes.ok)
        error(
            studentsRes.status,
            await backendMessage(studentsRes, 'De leerling kon niet worden geladen.')
        );

    const student = ((await studentsRes.json()) as Student[]).find((s) => s.id === id);
    if (!student) error(404, 'Leerling niet gevonden of niet aan jou gekoppeld');
    const list: ReadingList<Book> = await listRes.json();

    let results: { books: Book[]; total: number } | null = null;
    if (searchRes) {
        if (!searchRes.ok)
            error(
                searchRes.status,
                await backendMessage(searchRes, 'Zoeken in de catalogus is mislukt.')
            );
        const { books, meta } = await searchRes.json();
        results = { books, total: meta.total };
    }

    return {
        student,
        readingList: list.book,
        readStatus: list.status,
        q,
        results
    };
};

export const actions = {
    add: async ({ request, fetch, locals, params }) => {
        requireRole(locals, 'teacher');
        const id = studentId(params.id);
        const bookId = (await request.formData()).get('bookId');
        if (typeof bookId !== 'string' || !bookId) {
            return fail(400, { message: 'Geen boek gekozen.' });
        }

        const res = await fetch(`${BACKEND_URL}/students/${id}/readinglist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book: bookId, onlyId: true })
        });
        if (!res.ok)
            return fail(res.status, {
                message: await backendMessage(res, 'Het boek kon niet worden toegevoegd.')
            });
        return { added: bookId };
    }
} satisfies Actions;

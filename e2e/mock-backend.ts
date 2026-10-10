// In-memory stand-in for fastify-backend, so the e2e tests run without PostgreSQL and MongoDB
// (also on CI). It only implements the routes and response shapes the frontend uses.
// POST /__reset puts the data back to the seed below, the fixtures call it before every test.
// Run with: node e2e/mock-backend.ts (Node strips the types itself)
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 3999);

type Role = 'student' | 'teacher' | 'admin';
type Status = 'NotRead' | 'Reading' | 'Read';
type User = { id: number; userName: string; email: string; password: string; role: Role };
type Profile = {
    languageLevel: string;
    ReadingMotivation: string;
    length: string;
    genre: string[];
};
type List = { book: string[]; status: Record<string, Status> };

const PASSWORD = 'wachtwoord123';

const GENRES = ['avontuur', 'fantasy', 'liefde', 'oorlog', 'sport'];
const LEVELS = ['2F', '3F', '3F+'];
const TYPES = ['Book', 'Book', 'Magazine', 'OnlineArticle', 'PoetryBundle', 'BlogPost'];

// 12 books, so the catalogue has a second page with the default limit of 10
const BOOKS = Array.from({ length: 12 }, (_, i) => ({
    _id: `book${i + 1}`,
    title: i === 0 ? 'De Hobbit' : i === 1 ? 'Oorlogswinter' : `Testboek ${i + 1}`,
    author: `Auteur ${i + 1}`,
    genre: [GENRES[i % GENRES.length]],
    description: `Beschrijving van boek ${i + 1}.`,
    readingLevel: [LEVELS[i % LEVELS.length]],
    tags: [GENRES[i % GENRES.length]],
    materialType: TYPES[i % TYPES.length]
}));

let users: User[];
let profiles: Map<number, Profile>;
let lists: Map<number, List>;
// teacherId -> student ids
let links: Map<number, Set<number>>;

function reset() {
    users = [
        { id: 1, userName: 'sanne', email: 'sanne@school.nl', password: PASSWORD, role: 'student' },
        {
            id: 2,
            userName: 'thomas',
            email: 'thomas@school.nl',
            password: PASSWORD,
            role: 'teacher'
        },
        { id: 3, userName: 'anouk', email: 'anouk@school.nl', password: PASSWORD, role: 'admin' },
        { id: 4, userName: 'daan', email: 'daan@school.nl', password: PASSWORD, role: 'student' }
    ];
    profiles = new Map([
        [
            1,
            {
                languageLevel: 'B1',
                ReadingMotivation: 'ForPleasure',
                length: 'Long',
                genre: ['fantasy']
            }
        ]
    ]);
    lists = new Map();
    links = new Map([[2, new Set()]]);
}
reset();

// The token is just the user id, the frontend treats it as opaque
const tokenFor = (user: User) => `mock-token-${user.id}`;
function currentUser(req: IncomingMessage): User | undefined {
    const id = Number(req.headers.authorization?.replace('Bearer mock-token-', ''));
    return users.find((u) => u.id === id);
}

function listOf(userId: number): List {
    if (!lists.has(userId)) lists.set(userId, { book: [], status: {} });
    return lists.get(userId)!;
}
function listResponse(userId: number, onlyId: boolean) {
    const list = listOf(userId);
    return {
        userID: String(userId),
        book: onlyId ? list.book : list.book.map((id) => BOOKS.find((b) => b._id === id)),
        status: list.status
    };
}

function send(res: ServerResponse, status: number, body?: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readBody(req: IncomingMessage) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    return raw ? JSON.parse(raw) : {};
}

async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const path = url.pathname;
    const method = req.method ?? 'GET';
    const params = url.searchParams;
    const user = currentUser(req);
    const unauthorized = () => send(res, 401, { message: 'Unauthorized' });
    const forbidden = () => send(res, 403, { message: 'Forbidden' });

    if (method === 'POST' && path === '/__reset') {
        reset();
        return send(res, 204);
    }

    // Auth
    if (method === 'POST' && path === '/login') {
        const { email, password } = await readBody(req);
        const found = users.find((u) => u.email === email && u.password === password);
        if (!found) return send(res, 401, { message: 'Invalid credentials' });
        return send(res, 200, { access_token: tokenFor(found) });
    }
    if (method === 'POST' && path === '/register') {
        const { username, email, password } = await readBody(req);
        if (users.some((u) => u.userName === username))
            return send(res, 409, { message: 'Username already exists' });
        if (users.some((u) => u.email === email))
            return send(res, 409, { message: 'Email already exists' });
        const created: User = {
            id: Math.max(...users.map((u) => u.id)) + 1,
            userName: username,
            email,
            password,
            role: 'student'
        };
        users.push(created);
        return send(res, 200, { access_token: tokenFor(created) });
    }
    if (method === 'GET' && path === '/me') {
        if (!user) return unauthorized();
        const { id, userName, email, role } = user;
        return send(res, 200, { id: String(id), userName, email, role });
    }

    // Books
    if (method === 'GET' && path === '/books/genres') return send(res, 200, GENRES);
    if (method === 'GET' && path === '/books') {
        const page = Number(params.get('qpage') ?? 1);
        const limit = Number(params.get('qlimit') ?? 10);
        const title = params.get('title')?.toLowerCase();
        const levels = params.getAll('readingLevel');
        const types = params.getAll('materialType');
        const tags = params.getAll('tags');
        const matches = BOOKS.filter(
            (b) =>
                (!title || b.title.toLowerCase().includes(title)) &&
                (!levels.length || b.readingLevel.some((l) => levels.includes(l))) &&
                (!types.length || types.includes(b.materialType)) &&
                (!tags.length || b.tags.some((t) => tags.includes(t)))
        );
        return send(res, 200, {
            meta: { total: matches.length, page, limit },
            books: matches.slice((page - 1) * limit, page * limit)
        });
    }
    const bookMatch = path.match(/^\/books\/([^/]+)$/);
    if (method === 'GET' && bookMatch) {
        const book = BOOKS.find((b) => b._id === bookMatch[1]);
        return book ? send(res, 200, book) : send(res, 404, { message: 'Not Found' });
    }
    if (method === 'GET' && path === '/advice') {
        const amount = Number(params.get('amount') ?? 4);
        const genres = user ? (profiles.get(user.id)?.genre ?? []) : [];
        const advice = [...BOOKS]
            .sort(
                (a, b) => Number(genres.includes(b.genre[0])) - Number(genres.includes(a.genre[0]))
            )
            .slice(0, amount)
            .map((b) => ({
                ...b,
                motivation: genres.includes(b.genre[0])
                    ? `Past bij je favoriete thema ${b.genre[0]}.`
                    : 'Een populair boek bij andere lezers.'
            }));
        return send(res, 200, advice);
    }

    // Own reading list
    if (path === '/readinglist') {
        if (!user) return unauthorized();
        if (method === 'GET')
            return send(res, 200, listResponse(user.id, params.get('onlyId') === 'true'));
        const { book, onlyId, status } = await readBody(req);
        const list = listOf(user.id);
        if (method === 'DELETE') {
            list.book = list.book.filter((id) => id !== book);
            delete list.status[book];
        } else {
            if (!list.book.includes(book)) list.book.push(book);
            list.status[book] = method === 'PATCH' ? status : (list.status[book] ?? 'NotRead');
        }
        return send(res, 200, listResponse(user.id, onlyId));
    }

    // Reading profile
    if (path === '/reading-profile') {
        if (!user) return unauthorized();
        if (method === 'GET') {
            const profile = profiles.get(user.id);
            return profile ? send(res, 200, profile) : send(res, 404, { message: 'Not Found' });
        }
        const profile: Profile = await readBody(req);
        profiles.set(user.id, profile);
        return send(res, 200, profile);
    }

    // Student <-> teacher
    if (method === 'GET' && path === '/teachers') {
        if (!user) return unauthorized();
        if (user.role !== 'student') return forbidden();
        const teachers = users
            .filter((u) => u.role === 'teacher')
            .map((t) => ({
                id: t.id,
                userName: t.userName,
                linked: !!links.get(t.id)?.has(user.id)
            }));
        return send(res, 200, teachers);
    }
    const linkMatch = path.match(/^\/teachers\/(\d+)\/link$/);
    if (linkMatch) {
        if (!user) return unauthorized();
        const teacherId = Number(linkMatch[1]);
        if (!links.has(teacherId)) links.set(teacherId, new Set());
        if (method === 'POST') links.get(teacherId)!.add(user.id);
        else links.get(teacherId)!.delete(user.id);
        return send(res, 200, { success: true });
    }
    if (method === 'GET' && path === '/students') {
        if (!user) return unauthorized();
        if (user.role !== 'teacher') return forbidden();
        const profileOnly = params.get('profileOnly') !== 'false';
        const students = users
            .filter((u) => links.get(user.id)?.has(u.id))
            .map((s) => ({
                id: s.id,
                userName: s.userName,
                email: s.email,
                readingProfile: profiles.get(s.id) ?? null
            }))
            .filter((s) => !profileOnly || s.readingProfile);
        return send(res, 200, students);
    }
    const studentListMatch = path.match(/^\/students\/(\d+)\/readinglist$/);
    if (studentListMatch) {
        if (!user) return unauthorized();
        const studentId = Number(studentListMatch[1]);
        if (!links.get(user.id)?.has(studentId))
            return send(res, 404, { message: 'Student not found' });
        if (method === 'POST') {
            const { book, onlyId } = await readBody(req);
            const list = listOf(studentId);
            if (!list.book.includes(book)) list.book.push(book);
            list.status[book] ??= 'NotRead';
            return send(res, 200, listResponse(studentId, onlyId));
        }
        return send(res, 200, listResponse(studentId, params.get('onlyId') === 'true'));
    }

    // Admin
    if (method === 'GET' && path === '/users') {
        if (!user) return unauthorized();
        if (user.role !== 'admin') return forbidden();
        const q = params.get('q')?.toLowerCase();
        const accounts = users
            .filter((u) => !q || u.userName.includes(q) || u.email.includes(q))
            .map(({ id, userName, email, role }) => ({ id, userName, email, role }));
        return send(res, 200, accounts);
    }
    const roleMatch = path.match(/^\/users\/(\d+)\/role$/);
    if (method === 'PUT' && roleMatch) {
        if (!user) return unauthorized();
        if (user.role !== 'admin') return forbidden();
        const target = users.find((u) => u.id === Number(roleMatch[1]));
        if (!target) return send(res, 404, { message: 'User not found' });
        target.role = (await readBody(req)).role;
        return send(res, 200, { userName: target.userName, role: target.role });
    }

    send(res, 404, { message: 'Not Found' });
}

createServer((req, res) => {
    handle(req, res).catch((err) => {
        console.error(err);
        send(res, 500, { message: 'Internal Server Error' });
    });
}).listen(PORT, () => console.log(`Mock backend on http://localhost:${PORT}`));

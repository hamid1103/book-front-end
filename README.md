# Bookie – frontend

Bookie helps students find something to read. A student fills in a reading profile, gets reading advice with a reason per book, browses the catalogue and keeps a reading list. Teachers can view and add to the reading lists of their linked students, and an admin manages who is a teacher.

This repository is the web frontend, built with [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5), TypeScript and Tailwind CSS 4. The data comes from a separate backend, [`fastify-backend`](../fastify-backend), which talks to PostgreSQL (users, roles, the student–teacher links) and MongoDB (books, reading lists, reading profiles).

```
browser ──▶ SvelteKit (this repo, :5173) ──▶ fastify-backend (:3000) ──▶ PostgreSQL + MongoDB
```

The browser never calls the backend directly. Every request goes through SvelteKit's server, which adds the user's token (see [Authentication](#authentication)).

---

## Running it locally

### Requirements

- Node.js 22 or newer (the Docker image uses 22)
- A running PostgreSQL and MongoDB server, for the backend

### 1. Start the backend

The frontend can't do anything without the backend. In `../fastify-backend`:

```sh
cp .env.example .env    # then fill in the Postgres and MongoDB details and a SECRETKEY
npm install
npm run import:books    # first time only: loads the catalogue from the .xlsx into MongoDB
npm run dev             # http://localhost:3000, API reference on http://localhost:3000/reference
```

See the [backend README](../fastify-backend/README.md) for what each variable means.

### 2. Start the frontend

In this folder:

```sh
cp .env.example .env    # BACKEND_URL=http://localhost:3000
npm install
npm run dev             # http://localhost:5173
```

| Variable      | Description                                             | Default                 |
| ------------- | ------------------------------------------------------- | ----------------------- |
| `BACKEND_URL` | Base URL of `fastify-backend`. Only read on the server. | `http://localhost:3000` |

### 3. Create accounts

Register on `/register`. New accounts are students. To try the other roles:

```sh
# in ../fastify-backend
npm run assign:role -- <username or email> Admin
```

An admin can then make other accounts teachers on `/admin`. A student links themselves to a teacher on `/docenten`.

### Scripts

| Command           | What it does                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`     | Development server with hot reload                                                                 |
| `npm run check`   | Type-checks the TypeScript and Svelte files (`svelte-check`). Run this before you commit.          |
| `npm run lint`    | Checks formatting (Prettier) and code rules (ESLint). Must pass before you commit; CI runs it too. |
| `npm run format`  | Formats every file with Prettier                                                                   |
| `npm run build`   | Production build into `build/` (Node adapter)                                                      |
| `npm run preview` | Serves the production build locally                                                                |

### Docker

The `Dockerfile` builds a Node server that listens on port 3000 inside the container. The backend also uses 3000, so map the frontend to another port:

```sh
docker build -t bookie-frontend .
docker run -p 5173:3000 -e BACKEND_URL=http://host.docker.internal:3000 -e ORIGIN=http://localhost:5173 bookie-frontend
```

`ORIGIN` is needed so SvelteKit accepts the form posts (login, profile, …) in production.

---

## Folder structure

```
src/
├── app.d.ts              App.User and App.Locals (the logged-in user)
├── app.html              HTML shell
├── hooks.server.ts       Reads the JWT cookie on every request, adds it to backend calls
├── lib/
│   ├── components/       Reusable UI components (see below)
│   ├── server/           Server-only code, can't be imported in the browser
│   │   ├── api.ts        BACKEND_URL
│   │   └── auth.ts       requireRole() page guard, session cookie, backend error messages
│   ├── readingList.ts    Browser-side calls for the reading list (via /api/leeslijst)
│   └── types.ts          Shared types (Book, ReadingProfile, Role, …) and their Dutch labels
└── routes/               One folder per page
    ├── +layout.svelte    Header, navigation and account menu around every page
    ├── +page.svelte      Homepage with the advice carousel
    ├── advies/           Reading advice (FR3)
    ├── books/            Catalogue with filters and pagination (FR4), books/[slug] is one book
    ├── leesprofiel/      Fill in and change the reading profile (FR1, FR2)
    ├── Leeslijst/        Your reading list with read status (FR5)
    ├── docenten/         Students link themselves to a teacher (FR6)
    ├── leerlingen/       Teachers: linked students, and leerlingen/[id] for one student's list (FR6)
    ├── admin/            Admin: make accounts teacher or student
    ├── login/, register/ Authentication
    └── api/leeslijst/    Small proxy so the browser can update the reading list without a page reload
static/                   Images and icons, served as-is
```

### How a page works

Each route folder holds up to two files:

- **`+page.server.ts`** runs on the server only. `load` fetches what the page needs from the backend, and `actions` handle form posts (saving, linking, …). Guards like `requireRole(locals, 'teacher')` go at the top of both.
- **`+page.svelte`** shows the data. It gets the result of `load` as `data` and the result of an action as `form`.

Forms are plain HTML forms with `use:enhance`, so they also work without JavaScript. The heart button and the read status on `/Leeslijst` are the exceptions: they call `$lib/readingList.ts`, which posts to `/api/leeslijst`, so the page doesn't reload.

### Components

Everything in `src/lib/components` is reused on several pages. When you need a piece of UI that already exists elsewhere, use or extend one of these instead of copying markup.

| Component                                                | Used for                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `BookCard`, `BookCover`, `BookTags`, `Heart`             | A book in a list: generated cover, title, description, level/genre/tag badges, reading-list heart           |
| `ChoiceGroup`                                            | A `<fieldset>` of radio buttons or checkboxes shown as pills (profile form, catalogue filters, status tabs) |
| `ReadingStatusPicker`                                    | "Nog niet gelezen / Bezig / Gelezen" on a reading-list card                                                 |
| `ReadingProfileSummary`                                  | Short read-only view of a reading profile                                                                   |
| `AuthForm`, `FormField`                                  | The login and register card, and a labelled input                                                           |
| `SearchForm`                                             | A `q` search field as a GET form                                                                            |
| `PageHeader`, `EmptyState`, `CallToAction`, `Pagination` | Page title bar, "nothing here yet" box, banner with a link, page buttons                                    |
| `Avatar`, `Badge`                                        | Initial in a circle, small rounded label                                                                    |

### Authentication

1. `/login` and `/register` post to the backend, get a JWT back and store it in the `jwt` cookie (`httpOnly`, so scripts in the page can't read it).
2. `hooks.server.ts` reads the cookie on every request, asks the backend `/me` who it belongs to and puts the result in `locals.user`. An invalid or expired token deletes the cookie.
3. `handleFetch` in the same file adds `Authorization: Bearer <token>` to every request to `BACKEND_URL`. Always use the `fetch` that `load` and actions get as an argument, not the global one, or the token is missing.
4. Pages that need a login redirect to `/login`. Pages for one role use `requireRole`. The backend checks the role too, the frontend guard only keeps people away from pages they can't use.

---

## Example: making a change

Say you want to show the material type ("boek", "artikel", …) on every book card.

1. The field already exists: `materialType` on `Book` in `src/lib/types.ts`.
2. Every card renders its badges through `src/lib/components/BookTags.svelte`. Add a badge there:
    ```svelte
    {#if book.materialType}
        <Badge>{book.materialType}</Badge>
    {/if}
    ```
3. Run `npm run dev` and open `/books`, `/advies` or `/Leeslijst`. The badge shows on all of them, and in the homepage carousel.
4. Run `npm run format`, then `npm run check` and `npm run lint`, and make sure both report 0 errors.

A new page works the same way: add a folder under `src/routes` with a `+page.server.ts` that fetches from `BACKEND_URL` and a `+page.svelte` that shows `data`. Add the link to `links` in `src/routes/+layout.svelte` to put it in the navigation.

---

## Coding style

The code follows the official [Svelte 5](https://svelte.dev/docs/svelte) and [SvelteKit](https://svelte.dev/docs/kit) conventions, with these project rules on top.

### TypeScript

- Every `<script>` is `lang="ts"`, and `tsconfig.json` has `strict` on. `npm run check` must pass with 0 errors.
- Types the backend sends back live in `src/lib/types.ts`. Import them from there instead of writing a type inline in a page.
- Type component props in the `$props()` destructuring: `let {book, onToggle}: {book: Book, onToggle?: () => void} = $props();`
- Type load functions and actions with the generated `./$types` (`PageServerLoad`, `Actions`, `PageProps`).

### Svelte

- Svelte 5 runes only (`$state`, `$derived`, `$effect`, `$props`). No `export let`, no `$:` and no `on:click`; use `onclick`.
- Prefer `$derived` over `$effect` for values computed from other values. Use `$effect` only for side effects, such as localStorage or timers.
- Pages fetch data in `+page.server.ts`, never in `onMount`. Components don't fetch at all, they get data through props and report changes through callback props (`onToggle`, `onChange`, …).
- Pass content into a component with snippets (`children`, `{#snippet footer()}`), not with HTML strings.

### Naming and files

- Components: `PascalCase.svelte` in `src/lib/components`. Other files and variables: `camelCase`. Shared constants: `UPPER_SNAKE_CASE`, for example `READING_STATUS_LABELS`.
- Text shown to users is Dutch. Code, identifiers and comments are English.
- Code that uses secrets or `BACKEND_URL` goes in `src/lib/server`, so it can't end up in the browser bundle.

### Styling

- Tailwind utility classes only, no `<style>` blocks.
- Use the theme colours and fonts from `src/routes/layout.css` (`bg-surface`, `text-ink`, `border-accent`, `font-display`, …), not raw Tailwind colours.
- Design for mobile first, and add `md:` classes for larger screens. Every feature has to work on a phone too.

### Accessibility

- Clickable things are `<button>` or `<a>`, never a `div` or `svg` with `onclick`.
- Groups of radio buttons or checkboxes are a `<fieldset>` with a `<legend>`; `ChoiceGroup` does this for you.
- Every input has a `<label>`. Icon-only buttons get an `aria-label`. Decorative images get `alt=""`.
- Messages that appear after an action use `role="alert"` (errors) or `role="status"`/`aria-live="polite"` (confirmations).

### Formatting and comments

- 4 spaces of indentation in `.svelte` and `.ts` files.
- Formatting is done by [Prettier](https://prettier.io) (`prettier.config.js`): 4 spaces, single quotes, 100 characters per line, and Tailwind classes sorted by `prettier-plugin-tailwindcss`. Run `npm run format` instead of formatting by hand.
- Code rules are checked by [ESLint](https://eslint.org) (`eslint.config.js`) with the recommended JavaScript, `typescript-eslint` and `eslint-plugin-svelte` rules. For example, every `{#each}` needs a key and unused variables are errors. `npm run lint` runs both tools, and CI fails when either one does.
- Comments explain _why_ something is done, not what the line does. Write one above anything that would surprise a new reader, such as a workaround or a backend quirk.

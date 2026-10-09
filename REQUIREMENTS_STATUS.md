# Requirements status – LU1 Proof of Concept

Checked against _Opdracht LU1 – Proof of Concept v1.2_ on 2026-10-04.
Covers this frontend (`bookfrontend`) and the backend it talks to (`../fastify-backend`).

Legend: ✅ done · 🟡 partly done · ❌ not done

## Summary

| Requirement                               | Status                  |
| ----------------------------------------- | ----------------------- |
| FR1 – Fill in a reading profile           | ✅                      |
| FR2 – View and change the profile         | ✅                      |
| FR3 – Receive reading advice              | ✅ (simulated matching) |
| FR4 – Browse the catalogue                | ✅ (length simulated)   |
| FR5 – Keep a reading list                 | ✅                      |
| FR6 – Teachers can view reading lists     | ✅                      |
| NFR1 – Component architecture             | ✅                      |
| NFR2 – README                             | ✅                      |
| NFR3 – Automated tests                    | ✅                      |
| NFR4 – Responsive without losing features | ✅                      |
| NFR5 – WCAG level A                       | ✅                      |
| NFR6 – Authentication                     | ✅                      |
| NFR7 – Appropriate data storage           | ✅                      |

---

## Functional requirements

### FR1 – Fill in a reading profile ✅

- ✅ 4 questions: level, motivation, length, themes (minimum is 3).
- ✅ Required fields are marked with `*`, and the server rejects an incomplete profile (`src/routes/leesprofiel/+page.server.ts:30-35`).
- ✅ You get a confirmation after saving, then a redirect.
- ✅ Unsaved answers are kept as a per-user draft in localStorage, for new **and** existing profiles. A draft is only restored when it was based on the profile that's currently saved; outdated drafts are ignored. A notice with a "Wijzigingen weggooien" button shows when a draft is restored.
- ✅ The page redirects logged-out users to `/login`.

### FR2 – View and change the profile ✅

- ✅ A saved profile is loaded back into the form, and updates go through `PUT`.
- ✅ Changes are used in the next advice (see FR3).
- ✅ Leaving with unsaved changes asks for confirmation (`beforeNavigate`). "Unsaved" means the form differs from the last saved profile; closing the tab shows the browser's own dialog.

### FR3 – Receive reading advice ✅ (simulated matching)

The catalogue data is too thin for real matching: 183 items, no genres, only ~40 with tags, no length, and some are news articles. So the matching uses whatever signals exist, and the motivation text is partly simulated.

- ✅ `fastify-backend/src/Services/AdviceService.ts` scores every item against the profile:
    - themes: profile themes vs. book `tags` (+3 per match)
    - level: CEFR → referentiekader (`A2`→2F, `B1`→2F/3F, `B2`→3F/3F+, `C1`→3F+) (+2)
    - length: approximated by material type (articles = short, magazines/poetry = medium, books = long) (+1)
    - random jitter, so items with the same score rotate between visits
- ✅ Every suggestion gets a `motivation` ("waarom dit bij jou past"), built from the matched reasons plus the reading goal. When nothing matched, a simulated reason is used.
- ✅ Logged-out users, or users without a profile, get random items with a generic simulated reason.
- ✅ The motivation is shown in `BookCard` (`/advies`) and in the homepage carousel.
- ✅ At least 3 suggestions, all existing titles from the database. `/advies` shows 4, the homepage 3.
- ✅ Profile changes are used in the next advice (resolves part of FR2).
- The functions in `AdviceService.ts` are pure, ready for unit tests (NFR3).

### FR4 – Browse the catalogue ✅ (length simulated)

- ✅ Pagination with first/previous/next/last buttons, showing "Resultaten X-Y van de Z" and the total number of results.
- ✅ Filters on `/books`: title search, level (`2F`/`3F`/`3F+`), themes (book `tags`, list from `/books/genres`) and length.
    - There is no length in the data, so length maps onto `materialType`, the same way as in `AdviceService` (Kort = articles/blogs, Middel = magazines/poetry, Lang = books).
    - There are no genres in the data either, so themes/tags cover both "genre" and "topic".
- ✅ Filters combine (AND between groups, OR within a group), live in the URL (shareable, survive pagination) and reset with "Filters wissen". A new filter starts at page 1.
- ✅ The filter form is a plain GET form, so it also works without JavaScript; checkboxes apply right away when JS is on.
- ✅ An empty result shows "Geen boeken gevonden".
- ✅ Each book shows its title and description.

### FR5 – Keep a reading list ✅

- ✅ You can add books from the catalogue (`/books`) and from the advice page (`/advies`) with the heart button. The heart only shows for logged-in users.
- ✅ Read status per book: "Nog niet gelezen", "Bezig" or "Gelezen" (`NotRead`/`Reading`/`Read`), stored in the reading list's `status` map and set through `PATCH /readinglist`.
    - `ReadingStatusPicker` (a radio group in a `<fieldset>`) sits on every card in `/Leeslijst`. It updates right away and rolls back if the request fails.
    - `/Leeslijst` can be filtered by status (with counts) and shows "X van Y gelezen".
- ✅ Removing a book from the list also drops its status (backend).
- ✅ The list is personal (filtered on `userID`); linked teachers can view it and add to it (see FR6).
- The client calls live in `$lib/readingList.ts`, shared by `/books`, `/advies` and `/Leeslijst`.

### FR6 – Teachers can view reading lists ✅

Backend: `fastify-backend/src/Controllers/StudentTeacherController.ts`, guarded with `requireRole` (`Services/RoleService.ts`). New accounts get the student role. An admin makes accounts teachers on `/admin` (`GET /users`, `PUT /users/:id/role`); admins themselves are made with `npm run assign:role -- <user> admin`.

- ✅ The student links themselves to a teacher on `/docenten` (`GET /teachers`, `POST|DELETE /teachers/:id/link`), as form actions, so it also works without JS.
- ✅ `/leerlingen` shows the teacher's linked students who filled in a reading profile, with a summary of that profile (`GET /students`).
- ✅ `/leerlingen/[id]` shows a linked student's reading list with the read status per book (read-only), and their profile. Unlinked students give a 404 from the backend, and the page shows that as an error.
- ✅ On that page the teacher searches the catalogue by title and adds an item with "Toevoegen" (`POST /students/:id/readinglist`). Books already on the list show "Staat al op de lijst".
- ✅ The backend enforces roles: student routes need `student`, teacher routes need `teacher` (403 otherwise), and the teacher routes only work for linked students.
- ✅ The frontend guards both pages (`$lib/server/auth.ts`): logged out → `/login`, wrong role → `/` (NFR6). The nav shows "Docenten" to students and "Leerlingen" to teachers.

---

## Non-functional requirements

### NFR1 – Component architecture ✅

- ✅ Reusable components in `src/lib/components`, every repeated piece of UI has one:
    - Books: `BookCard`, `BookCover`, `BookTags` (level/genre/tag badges, shared by `BookCard` and the homepage carousel), `Heart`.
    - Forms: `ChoiceGroup` (a `<fieldset>` of radio/checkbox pills, used by `/leesprofiel`, the `/books` filters and the `/Leeslijst` status tabs), `ReadingStatusPicker`, `SearchForm` (`/admin`, `/leerlingen/[id]`), `AuthForm` + `FormField` (`/login`, `/register`).
    - Layout: `PageHeader`, `EmptyState`, `CallToAction` (`/advies`), `Pagination` (`/books`), `Avatar`, `Badge` (tags, reading status, roles, "Gekoppeld"), `ReadingProfileSummary`.
- ✅ The duplicates are gone: the 10 copy-pasted pills on `/leesprofiel`, the homepage hero (one block, text depends on login), the 4 call-to-actions on `/advies` (one responsive component), the pagination buttons, and the carousel tag pills.
- ✅ Shared types live in `$lib/types` (`Book`, `ReadingProfile`, `ReadingList`, `Role`, ...). The inline `Book` type and the profile type on `/leesprofiel` use them now, and `App.User.role` is the `Role` type.
- ✅ The SvelteKit server-load → backend pattern is used consistently, client calls go through `$lib/readingList.ts`.
- `src/lib/GeneralState.svelte.ts` isn't used anymore (the homepage reads the user from the layout data) and can be deleted.

### NFR2 – README ✅

`README.md` replaces the default `sv` template:

- ✅ Setup: requirements, starting the backend (`.env`, book import), the frontend's `BACKEND_URL`, making an admin, the scripts and Docker.
- ✅ The folder structure, how a page works (`load`/actions, `use:enhance`, the `/api/leeslijst` proxy), the components and the authentication flow.
- ✅ A worked example of a small change (a badge on every book card), so a teammate can make and run a change without help.
- ✅ A coding style guide (Svelte 5/SvelteKit conventions plus project rules for TypeScript, naming, Tailwind theme tokens and accessibility). The code follows it: runes only, `lang="ts"` everywhere, 4-space indentation, theme colours instead of raw Tailwind colours, and `npm run check` passes with 0 errors.
- ✅ The guide is enforced by tooling: Prettier (`prettier.config.js`, 4 spaces) and ESLint (`eslint.config.js`, recommended JS/TypeScript/Svelte rules). `npm run lint` passes with 0 errors and runs in CI (`.github/workflows/playwright.yml`).

### NFR3 – Automated tests ✅

- There's no test runner (no Vitest) and no tests in either repo.
- `fastify-backend/src/Services/AdviceService.ts` is pure and ready to be tested (e.g. empty profile, book without tags/level, `amount` larger than the catalogue).

### NFR4 – Responsive without losing features ✅

- ✅ A lot of mobile work has been done (nav wraps, `md:` breakpoints everywhere).
- ✅ The `/advies` content is a fixed `w-2/3` wide, which is cramped on a phone.
- ✅ The "Bekijk mijn advies" and "Vul je leesprofiel in" buttons on the homepage are `<button>`s with no action, so they do nothing on any device.
- ✅ `/leesprofiel` doesn't appear in the nav. You can only reach it from the advice page.

### NFR5 – WCAG level A ✅ (several clear failures)

- ✅ **The heart** (`src/lib/components/Heart.svelte`) is now a `<button>` with an accessible name and `aria-pressed`.
- ✅ **The carousel** has a pause/start button and pauses on hover, keyboard focus and touch (2.2.2 Pause, Stop, Hide). It starts paused with `prefers-reduced-motion`, and hidden slides are `inert`.
- ✅ **The radio/checkbox groups** all use `ChoiceGroup`, a `<fieldset>` with a `<legend>`.
- ✅ **The page language**: `src/app.html` has `lang="en"` but the content is Dutch. Fails 3.1.1.
- ✅ The `sr-only` inputs show a focus ring on their pill (`has-focus-visible`).

### NFR6 – Authentication ✅

- ✅ The backend signs and checks JWTs, the cookie is `httpOnly`, and protected routes check `req.user`.
- ✅ Role-based authorization on the student–teacher routes (`requireRole`, see FR6).
- ✅ Admin panel on `/admin` (admin only): search accounts and switch them between student and teacher. Admins can't change their own role (backend), and admin roles aren't changeable from the UI.
- Frontend:
    - ✅ `/Leeslijst` redirects to `/login`.
    - ✅ `/leesprofiel` redirects to `/login`.
    - ✅ Registration on `/register`.
    - ✅ "Uitloggen" in the account menu posts to `/logout`, which deletes the `jwt` cookie, and then reloads the page data (`refreshAll`).

### NFR7 – Appropriate data storage ✅

- ✅ Users, roles and the student–teacher link are in Postgres with foreign keys (via Sequelize associations).
- ✅ The book catalogue is in MongoDB.
- ✅ The reading list and reading profile are also in MongoDB, linked by a plain `userID: Number` with no foreign key. The reading list is exactly the "transactional, strongly related" data the requirement says belongs in the relational database, especially once read status and teacher additions arrive. Either move it to Postgres (e.g. `reading_list_item(user_id FK, book_id, read bool)`), or be ready to explain the choice.

---

## Suggested order

1. ~~**FR3** – matching with a reason per book.~~ Done.
2. ~~**FR5** – add a read status, and the heart on the advice page.~~ Done (the reading list is still in MongoDB, see NFR7).
3. ~~**FR4** – filters on `/books`, in both backend and frontend, plus the total result count.~~ Done.
4. ~~**FR6 + role checks**~~ Done.
5. Smaller fixes:
    - [x] NFR5: Heart → `<button>`, carousel pause, fieldsets, `lang="nl"`
    - [x] FR2: unsaved-changes prompt
    - [x] NFR4: wire up the dead homepage buttons
    - [x] NFR2: README + Prettier/ESLint
    - [x] NFR3: Vitest

## TODO

- [x] Skeleton loading: a progress bar on every client-side navigation, `/advies` streams the advice behind `BookCardSkeleton`s, `/books` stays server rendered (SEO) and shows skeletons while filtering/paginating.
- [ ] A universal error page (`src/routes/+error.svelte`).

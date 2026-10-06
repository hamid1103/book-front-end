# Requirements status – LU1 Proof of Concept

Checked against *Opdracht LU1 – Proof of Concept v1.2* on 2026-10-04.
Covers this frontend (`bookfrontend`) and the backend it talks to (`../fastify-backend`).

Legend: ✅ done · 🟡 partly done · ❌ not done

## Summary

| Requirement | Status |
| --- | --- |
| FR1 – Fill in a reading profile | ✅ |
| FR2 – View and change the profile | ✅ |
| FR3 – Receive reading advice | ✅ (simulated matching) |
| FR4 – Browse the catalogue | ✅ (length simulated) |
| FR5 – Keep a reading list | ✅ (teacher part: see FR6) |
| FR6 – Teachers can view reading lists | ❌ |
| NFR1 – Component architecture | 🟡 |
| NFR2 – README | ❌ |
| NFR3 – Automated tests | ❌ |
| NFR4 – Responsive without losing features | 🟡 |
| NFR5 – WCAG level A | ❌ |
| NFR6 – Authentication | 🟡 |
| NFR7 – Appropriate data storage | 🟡 |

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

### FR5 – Keep a reading list ✅ (teacher part: see FR6)

- ✅ You can add books from the catalogue (`/books`) and from the advice page (`/advies`) with the heart button. The heart only shows for logged-in users.
- ✅ Read status per book: "Nog niet gelezen", "Bezig" or "Gelezen" (`NotRead`/`Reading`/`Read`), stored in the reading list's `status` map and set through `PATCH /readinglist`.
  - `ReadingStatusPicker` (a radio group in a `<fieldset>`) sits on every card in `/Leeslijst`. It updates right away and rolls back if the request fails.
  - `/Leeslijst` can be filtered by status (with counts) and shows "X van Y gelezen".
- ✅ Removing a book from the list also drops its status (backend).
- ✅ The list is personal (filtered on `userID`).
- The client calls live in `$lib/readingList.ts`, shared by `/books`, `/advies` and `/Leeslijst`.
- ❌ Teacher access is missing (see FR6).

### FR6 – Teachers can view reading lists ❌

The only groundwork is in the backend: a `StudentTeacher` self-association (`fastify-backend/src/Model/associations.ts:8`) and `Role`/`UserRole` tables.

Not built yet:

- [ ] Endpoints for linking a student to a teacher
- [ ] Teacher sees the list of students who filled in a profile
- [ ] Teacher views the reading lists of linked students only
- [ ] Teacher adds a catalogue book to a linked student's list
- [ ] Role checks in the backend
- [ ] All frontend pages for this

---

## Non-functional requirements

### NFR1 – Component architecture 🟡

- ✅ `BookCard`, `BookCover` and `Heart` are good reusable components, and the SvelteKit server-load → backend pattern is used consistently.
- ❌ There's a lot of duplicated UI, which the requirement explicitly rules out:
  - The radio-pill label is copy-pasted 10× in `src/routes/leesprofiel/+page.svelte`. This should be a `RadioPill`/`ChoiceGroup` component.
  - The tag pills in `src/routes/+page.svelte:178-188` copy what `BookCard` already renders.
  - The hero block on the homepage is duplicated for logged-in and logged-out users.
  - The call-to-action on `/advies` is written 4 times (desktop/mobile × logged-in/out).
  - The pagination buttons are repeated twice.
- 🟡 Types are duplicated too: inline `Book` types in `src/routes/advies/+page.server.ts` and `src/routes/books/[slug]/+page.server.ts` instead of `$lib/types`, and `GeneralState`'s user type repeats `App.User`.

### NFR2 – README ❌

`README.md` is still the default `sv` template. It needs:

- [ ] Setup steps (backend URL, `.env`, starting both backends)
- [ ] The folder structure and the main parts
- [ ] A coding style guide

There's no Prettier or ESLint config, so there's also nothing that shows a style guide is "applied in the code".

### NFR3 – Automated tests ❌

- There's no test runner (no Vitest) and no tests in either repo.
- `fastify-backend/src/Services/AdviceService.ts` is pure and ready to be tested (e.g. empty profile, book without tags/level, `amount` larger than the catalogue).

### NFR4 – Responsive without losing features 🟡

- ✅ A lot of mobile work has been done (nav wraps, `md:` breakpoints everywhere).
- 🟡 The `/advies` content is a fixed `w-2/3` wide, which is cramped on a phone.
- ❌ The "Bekijk mijn advies" and "Vul je leesprofiel in" buttons on the homepage are `<button>`s with no action, so they do nothing on any device.
- 🟡 `/leesprofiel` doesn't appear in the nav. You can only reach it from the advice page.

### NFR5 – WCAG level A ❌ (several clear failures)

- **The heart** (`src/lib/components/Heart.svelte`) is an `<svg on:click>`, not a `<button>`. It can't be reached with the keyboard and has no accessible name. Fails 2.1.1 and 4.1.2.
- **The carousel** moves every 5 seconds and only pauses on mouse hover. Fails 2.2.2 (Pause, Stop, Hide), which is level A. It needs a pause button, and it should also pause on focus.
- **The radio/checkbox groups** have no `<fieldset>`/`<legend>`; the group label is a plain `<span>`. Fails 1.3.1.
- **The page language**: `src/app.html` has `lang="en"` but the content is Dutch. Fails 3.1.1.
- The inputs are `sr-only`, so there's no visible keyboard focus on the profile options. Strictly that's 2.4.7 (level AA), but it's worth fixing.

### NFR6 – Authentication 🟡

- ✅ The backend signs and checks JWTs, the cookie is `httpOnly`, and protected routes check `req.user`.
- ❌ No role-based authorization. Roles exist in the database but are never checked.
- Frontend:
  - ✅ `/Leeslijst` redirects to `/login`.
  - ✅ `/leesprofiel` redirects to `/login`.
  - ❌ There's no logout, and no registration even though the page title says "Login / Registreren".

### NFR7 – Appropriate data storage 🟡

- ✅ Users, roles and the student–teacher link are in Postgres with foreign keys (via Sequelize associations).
- ✅ The book catalogue is in MongoDB.
- 🟡 The reading list and reading profile are also in MongoDB, linked by a plain `userID: Number` with no foreign key. The reading list is exactly the "transactional, strongly related" data the requirement says belongs in the relational database, especially once read status and teacher additions arrive. Either move it to Postgres (e.g. `reading_list_item(user_id FK, book_id, read bool)`), or be ready to explain the choice.

---

## Suggested order

1. ~~**FR3** – matching with a reason per book.~~ Done.
2. ~~**FR5** – add a read status, and the heart on the advice page.~~ Done (the reading list is still in MongoDB, see NFR7).
3. ~~**FR4** – filters on `/books`, in both backend and frontend, plus the total result count.~~ Done.
4. **FR6 + role checks** – the biggest feature, and it's missing completely.
5. Smaller fixes:
   - [ ] NFR5: Heart → `<button>`, carousel pause, fieldsets, `lang="nl"`
   - [x] FR2: unsaved-changes prompt
   - [ ] NFR4: wire up the dead homepage buttons
   - [ ] NFR2: README, Prettier/ESLint
   - [ ] NFR3: Vitest

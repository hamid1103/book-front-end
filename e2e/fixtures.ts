import { test as base, expect, type Locator, type Page } from '@playwright/test';

// Must match the port in playwright.config.ts and the seed data in mock-backend.ts
export const BACKEND_URL = 'http://localhost:3999';
export const PASSWORD = 'wachtwoord123';

export const accounts = {
    // Has a reading profile, not linked to a teacher
    student: { id: 1, userName: 'sanne', email: 'sanne@school.nl' },
    teacher: { id: 2, userName: 'thomas', email: 'thomas@school.nl' },
    admin: { id: 3, userName: 'anouk', email: 'anouk@school.nl' },
    // Student without a reading profile
    newStudent: { id: 4, userName: 'daan', email: 'daan@school.nl' }
} as const;
export type AccountName = keyof typeof accounts;

type Fixtures = {
    // Logs in by setting the session cookie directly, faster than filling in the form every test.
    // The login form itself is tested in auth.spec.ts
    loginAs: (account: AccountName) => Promise<void>;
};

export const test = base.extend<Fixtures & { resetBackend: void }>({
    resetBackend: [
        async ({ request }, use) => {
            await request.post(`${BACKEND_URL}/__reset`);
            await use();
        },
        { auto: true }
    ],
    loginAs: async ({ context, baseURL }, use) => {
        await use(async (account) => {
            await context.addCookies([
                { name: 'jwt', value: `mock-token-${accounts[account].id}`, url: baseURL! }
            ]);
        });
    }
});

export { expect };

// The account menu is the round button in the header
export async function openAccountMenu(page: Page) {
    await page.getByRole('button', { name: 'Account' }).click();
}

// ChoiceGroup and ReadingStatusPicker hide the real input (sr-only) inside a pill-shaped label,
// so a user clicks the label. Finds that label by the input's accessible name
export function pill(scope: Page | Locator, role: 'radio' | 'checkbox', name: string) {
    // `has` is resolved inside each label, so the inner locator must start from the page, not the scope
    const page = 'goto' in scope ? scope : scope.page();
    return scope.locator('label').filter({ has: page.getByRole(role, { name, exact: true }) });
}

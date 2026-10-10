import { accounts, expect, openAccountMenu, PASSWORD, test } from './fixtures';

test.describe('Registreren', () => {
    test('new account goes to the reading profile and is logged in', async ({ page }) => {
        await page.goto('/register');
        await page.getByLabel('Gebruikersnaam').fill('lotte');
        await page.getByLabel('E-mailadres').fill('lotte@school.nl');
        await page.getByLabel('Wachtwoord', { exact: true }).fill(PASSWORD);
        await page.getByLabel('Herhaal wachtwoord').fill(PASSWORD);
        await page.getByRole('button', { name: 'Account aanmaken' }).click();

        await expect(page).toHaveURL('/leesprofiel');
        await expect(
            page.getByRole('heading', { name: 'Vertel ons wat je graag leest' })
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Account' })).toHaveText('L');
    });

    test('shows an error when the passwords differ and keeps the typed values', async ({
        page
    }) => {
        await page.goto('/register');
        await page.getByLabel('Gebruikersnaam').fill('lotte');
        await page.getByLabel('E-mailadres').fill('lotte@school.nl');
        await page.getByLabel('Wachtwoord', { exact: true }).fill(PASSWORD);
        await page.getByLabel('Herhaal wachtwoord').fill('iets-anders');
        await page.getByRole('button', { name: 'Account aanmaken' }).click();

        await expect(page.getByRole('alert')).toContainText('De wachtwoorden komen niet overeen.');
        await expect(page).toHaveURL('/register');
        await expect(page.getByLabel('Gebruikersnaam')).toHaveValue('lotte');
        await expect(page.getByLabel('E-mailadres')).toHaveValue('lotte@school.nl');
    });

    test('translates the backend error for an email that is taken', async ({ page }) => {
        await page.goto('/register');
        await page.getByLabel('Gebruikersnaam').fill('nieuw');
        await page.getByLabel('E-mailadres').fill(accounts.student.email);
        await page.getByLabel('Wachtwoord', { exact: true }).fill(PASSWORD);
        await page.getByLabel('Herhaal wachtwoord').fill(PASSWORD);
        await page.getByRole('button', { name: 'Account aanmaken' }).click();

        await expect(page.getByRole('alert')).toContainText(
            'Er bestaat al een account met dit e-mailadres.'
        );
    });
});

test.describe('Inloggen', () => {
    test('logs in, greets the user and logs out again', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('E-mailadres').fill(accounts.student.email);
        await page.getByLabel('Wachtwoord').fill(PASSWORD);
        await page.getByRole('button', { name: 'Inloggen' }).click();

        await expect(page).toHaveURL('/');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            'Hoi sanne, klaar voor je volgende boek?'
        );

        await openAccountMenu(page);
        await expect(page.getByText(accounts.student.email)).toBeVisible();
        await page.getByRole('button', { name: 'Uitloggen' }).click();

        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            'Hallo! Klaar om je leeslijst te starten?'
        );
    });

    test('shows an error for a wrong password and hides it while typing', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('E-mailadres').fill(accounts.student.email);
        await page.getByLabel('Wachtwoord').fill('fout-wachtwoord');
        await page.getByRole('button', { name: 'Inloggen' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toContainText('Onjuist e-mailadres of wachtwoord.');
        await expect(page.getByLabel('E-mailadres')).toHaveValue(accounts.student.email);
        await expect(page.getByLabel('Wachtwoord')).toHaveAttribute('aria-invalid', 'true');

        await page.getByLabel('Wachtwoord').fill('opnieuw');
        await expect(alert).toBeHidden();
    });

    test('logged in users are sent away from the login page', async ({ page, loginAs }) => {
        await loginAs('student');
        await page.goto('/login');
        await expect(page).toHaveURL('/');
    });
});

test.describe('Toegang', () => {
    test('pages that need a login redirect to /login', async ({ page }) => {
        for (const path of ['/Leeslijst', '/leesprofiel', '/docenten', '/leerlingen', '/admin']) {
            await page.goto(path);
            await expect(page, `${path} should redirect`).toHaveURL('/login');
        }
    });

    test('a student can not open the teacher and admin pages', async ({ page, loginAs }) => {
        await loginAs('student');
        for (const path of ['/leerlingen', '/admin']) {
            await page.goto(path);
            await expect(page, `${path} should redirect`).toHaveURL('/');
        }
    });

    test('the nav only shows the links for the current role', async ({ page, loginAs }) => {
        const nav = page.getByRole('navigation').first();

        await page.goto('/');
        await expect(nav.getByRole('link')).toHaveText([
            'Home',
            'Catalogus',
            'Leeslijst',
            'Advies'
        ]);

        await loginAs('student');
        await page.reload();
        await expect(nav.getByRole('link', { name: 'Docenten' })).toBeVisible();

        await loginAs('teacher');
        await page.reload();
        await expect(nav.getByRole('link', { name: 'Leerlingen' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Docenten' })).toHaveCount(0);

        await loginAs('admin');
        await page.reload();
        await expect(nav.getByRole('link', { name: 'Beheer' })).toBeVisible();
    });
});

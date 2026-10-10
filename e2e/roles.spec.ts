import { accounts, expect, test } from './fixtures';

test('a student links to a teacher, who then adds a book to their list', async ({
    page,
    loginAs
}) => {
    await loginAs('student');
    await page.goto('/docenten');
    await expect(page.getByText('0 gekoppeld')).toBeVisible();
    await page.getByRole('button', { name: /^Koppelen\W+thomas$/ }).click();
    await expect(page.getByText('1 gekoppeld')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ontkoppelen\W+thomas$/ })).toBeVisible();

    await loginAs('teacher');
    await page.goto('/leerlingen');
    await expect(page.getByText('1 met leesprofiel')).toBeVisible();
    await page.getByRole('link', { name: /sanne/ }).click();

    await expect(page).toHaveURL(`/leerlingen/${accounts.student.id}`);
    await expect(page.getByRole('heading', { name: 'Leeslijst van sanne' })).toBeVisible();
    await expect(page.getByText('De leeslijst van sanne is nog leeg.')).toBeVisible();

    await page.getByRole('searchbox', { name: 'Zoek een titel in de catalogus' }).fill('hobbit');
    await page.getByRole('button', { name: 'Zoek' }).click();
    await page.getByRole('button', { name: /^Toevoegen\W+De Hobbit$/ }).click();

    await expect(page.getByText('Staat al op de lijst')).toBeVisible();
    await expect(page.getByText('0 van 1 gelezen')).toBeVisible();

    // The student sees the book on their own list
    await loginAs('student');
    await page.goto('/Leeslijst');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
});

test('a teacher can not open the list of a student that is not linked', async ({
    page,
    loginAs
}) => {
    await loginAs('teacher');
    await page.goto('/leerlingen');
    await expect(page.getByRole('heading', { name: 'Nog geen leerlingen' })).toBeVisible();

    const response = await page.goto(`/leerlingen/${accounts.student.id}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Leerling niet gevonden of niet aan jou gekoppeld')).toBeVisible();
});

test('an admin makes a student a teacher', async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/admin');
    await expect(page.getByText('4 accounts · 1 docenten')).toBeVisible();
    // Admins can't change their own role
    await expect(page.getByRole('button', { name: /anouk$/ })).toHaveCount(0);

    await page.getByRole('button', { name: /^Maak docent\W+daan$/ }).click();
    await expect(page.getByText('daan is nu docent.')).toBeVisible();
    await expect(page.getByText('4 accounts · 2 docenten')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Maak student\W+daan$/ })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Zoek op gebruikersnaam of e-mail' }).fill('daan');
    await page.getByRole('button', { name: 'Zoek' }).click();
    await expect(page.getByText('1 accounts · 1 docenten')).toBeVisible();

    // The new teacher shows up for students
    await loginAs('student');
    await page.goto('/docenten');
    await expect(page.getByRole('button', { name: /^Koppelen\W+daan$/ })).toBeVisible();
});

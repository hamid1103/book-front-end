import { expect, test } from './fixtures';

test('a new student fills in a profile and gets advice', async ({ page, loginAs }) => {
    await loginAs('newStudent');
    await page.goto('/leesprofiel');

    await page.getByRole('group', { name: 'Lees Niveau' }).getByText('B2').click();
    await page.getByRole('group', { name: 'Lees Motivatie' }).getByText('Voor de lol').click();
    await page.getByRole('group', { name: 'Lees materiaal duur' }).getByText('Lang').click();
    await page.getByRole('group', { name: "Favoriete Thema's" }).getByText('oorlog').click();
    await page.getByRole('button', { name: 'Opslaan' }).click();

    await expect(page.getByRole('status')).toContainText('Je leesprofiel is opgeslagen!');
    // The page redirects to the advice after a short pause
    await expect(page).toHaveURL('/advies');
    await expect(page.getByRole('heading', { name: 'Jouw leesadvies' })).toBeVisible();
    // The mock backend puts books matching the chosen theme first
    await expect(page.getByText('Past bij je favoriete thema oorlog.').first()).toBeVisible();
});

test('requires at least one theme', async ({ page, loginAs }) => {
    await loginAs('newStudent');
    await page.goto('/leesprofiel');
    await page.getByRole('button', { name: 'Opslaan' }).click();

    await expect(page.getByRole('alert')).toHaveText('Kies minstens één thema.');
    await expect(page).toHaveURL('/leesprofiel');
});

test('shows the saved profile and keeps unsaved changes as a draft', async ({ page, loginAs }) => {
    await loginAs('student');
    await page.goto('/leesprofiel');

    // Seeded profile: B1, for pleasure, long, fantasy
    await expect(page.getByRole('radio', { name: 'B1' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'fantasy' })).toBeChecked();

    await page.getByRole('group', { name: "Favoriete Thema's" }).getByText('sport').click();
    await expect(page.getByRole('checkbox', { name: 'sport' })).toBeChecked();

    await page.reload();
    await expect(page.getByRole('status')).toContainText('niet-opgeslagen wijzigingen');
    await expect(page.getByRole('checkbox', { name: 'sport' })).toBeChecked();

    await page.getByRole('button', { name: 'Wijzigingen weggooien' }).click();
    await expect(page.getByRole('checkbox', { name: 'sport' })).not.toBeChecked();
});

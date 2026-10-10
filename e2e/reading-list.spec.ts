import { expect, pill, test } from './fixtures';

test.beforeEach(async ({ loginAs }) => {
    await loginAs('student');
});

test('starts empty and links to the catalogue', async ({ page }) => {
    await page.goto('/leeslijst');
    await expect(page.getByRole('heading', { name: 'Je leeslijst is nog leeg' })).toBeVisible();
    await page.getByRole('link', { name: 'Blader door de catalogus' }).click();
    await expect(page).toHaveURL('/boeken');
});

test('adds a book with the heart in the catalogue', async ({ page }) => {
    await page.goto('/boeken');
    await page.getByRole('button', { name: 'Voeg De Hobbit toe aan leeslijst' }).click();
    await expect(
        page.getByRole('button', { name: 'Verwijder De Hobbit van leeslijst' })
    ).toHaveAttribute('aria-pressed', 'true');

    // Saved on the server, so it's still there after a reload and on the list page
    await page.reload();
    await expect(
        page.getByRole('button', { name: 'Verwijder De Hobbit van leeslijst' })
    ).toBeVisible();
    await page.goto('/leeslijst');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
});

test('adds a book from the detail page and sets the reading status', async ({ page }) => {
    await page.goto('/boeken/book2');
    await page.getByRole('button', { name: 'Voeg toe aan leeslijst' }).click();
    await expect(page.getByRole('button', { name: 'Verwijder van leeslijst' })).toBeVisible();

    const status = page.getByRole('group', { name: 'Leesstatus van Oorlogswinter' });
    await expect(status.getByRole('radio', { name: 'Nog niet gelezen' })).toBeChecked();
    await status.getByText('Gelezen', { exact: true }).click();
    await expect(status.getByRole('radio', { name: 'Gelezen', exact: true })).toBeChecked();

    await page.goto('/leeslijst');
    await expect(page.getByText('1 van 1 gelezen')).toBeVisible();
});

test('filters the list on status and removes a book', async ({ page }) => {
    // Two books on the list, one of them being read
    await page.goto('/boeken');
    await page.getByRole('button', { name: 'Voeg De Hobbit toe aan leeslijst' }).click();
    await page.getByRole('button', { name: 'Voeg Oorlogswinter toe aan leeslijst' }).click();
    await expect(page.getByRole('button', { name: /^Verwijder/ })).toHaveCount(2);

    await page.goto('/leeslijst');
    await page.getByRole('group', { name: 'Leesstatus van De Hobbit' }).getByText('Bezig').click();

    // The filter labels end with a count, e.g. "Gelezen (0)"
    const tabs = page.getByRole('group', { name: 'Toon boeken met leesstatus' });
    await pill(tabs, 'radio', 'Bezig (1)').click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
    await pill(tabs, 'radio', 'Gelezen (0)').click();
    await expect(page.getByText('Geen boeken met deze status.')).toBeVisible();
    await pill(tabs, 'radio', 'Alle (2)').click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);

    await page.getByRole('button', { name: 'Verwijder Oorlogswinter van leeslijst' }).click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
    await page.reload();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
});

test('shows a message when the reading list can not be updated', async ({ page }) => {
    await page.route('/api/leeslijst', (route) => route.fulfill({ status: 500, json: {} }));
    await page.goto('/boeken');
    await page.getByRole('button', { name: 'Voeg De Hobbit toe aan leeslijst' }).click();

    await expect(
        page.getByText('Je leeslijst kon niet worden bijgewerkt. Probeer het later opnieuw.')
    ).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Voeg De Hobbit toe aan leeslijst' })
    ).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: 'Melding sluiten' }).click();
    await expect(page.getByText('Je leeslijst kon niet worden bijgewerkt.')).toBeHidden();
});

import { expect, pill, test } from './fixtures';

// The mock backend has 12 books: "De Hobbit", "Oorlogswinter" and "Testboek 3" to "Testboek 12"

test.describe('Catalogus', () => {
    test('lists the first page of books', async ({ page }) => {
        await page.goto('/boeken');

        await expect(page.getByRole('heading', { name: 'Blader door alle boeken' })).toBeVisible();
        await expect(page.getByText('12 resultaten')).toBeVisible();
        await expect(page.getByRole('heading', { level: 2 })).toHaveCount(10);
        await expect(page.getByText('Resultaten 1-10 van de 12')).toBeVisible();
    });

    test('pages through the results', async ({ page }) => {
        await page.goto('/boeken');
        await page.getByRole('button', { name: 'Volgende pagina' }).click();

        await expect(page).toHaveURL(/page=2/);
        await expect(page.getByText('Resultaten 11-12 van de 12')).toBeVisible();
        await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
        await expect(page.getByRole('button', { name: 'Volgende pagina' })).toBeDisabled();

        await page.getByRole('button', { name: 'Eerste pagina' }).click();
        await expect(page.getByText('Resultaten 1-10 van de 12')).toBeVisible();
    });

    test('searches on title', async ({ page }) => {
        await page.goto('/boeken');
        await page.getByRole('searchbox', { name: 'Zoek op titel' }).fill('hobbit');
        await page.getByRole('button', { name: 'Zoeken' }).click();

        await expect(page).toHaveURL(/q=hobbit/);
        await expect(page.getByText('1 resultaat', { exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { level: 2 })).toHaveText(['De Hobbit']);
    });

    test('shows a message when nothing matches', async ({ page }) => {
        await page.goto('/boeken?q=bestaat-niet');
        await expect(page.getByText('Geen boeken gevonden')).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Paginering' })).toHaveCount(0);
    });

    test('filters on level and clears the filters again', async ({ page }) => {
        await page.goto('/boeken');
        // The checkboxes are visually hidden inside pill labels, so click the label
        await page.getByRole('group', { name: 'Niveau' }).getByText('3F+').click();

        await expect(page).toHaveURL(/level=3F%2B/);
        await expect(page.getByText('4 resultaten')).toBeVisible();
        await expect(page.getByRole('checkbox', { name: '3F+' })).toBeChecked();

        await page.getByRole('link', { name: 'Filters wissen (1)' }).click();
        await expect(page.getByText('12 resultaten')).toBeVisible();
        await expect(page.getByRole('checkbox', { name: '3F+' })).not.toBeChecked();
    });

    test('filters on theme', async ({ page }) => {
        await page.goto('/boeken');
        await page.locator('summary', { hasText: "Thema's" }).click();
        await pill(page, 'checkbox', '#oorlog').click();

        await expect(page).toHaveURL(/tags=oorlog/);
        await expect(page.getByText('(1 gekozen)')).toBeVisible();
        await expect(page.getByRole('heading', { level: 2 })).toHaveText([
            'Testboek 4',
            'Testboek 9'
        ]);
    });

    test('opens the detail page of a book', async ({ page }) => {
        await page.goto('/boeken');
        await page.getByRole('heading', { name: 'De Hobbit' }).click();

        await expect(page).toHaveURL('/boeken/book1');
        await expect(page).toHaveTitle('De Hobbit · Bookie');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('De Hobbit');
        await expect(page.getByText('Beschrijving van boek 1.')).toBeVisible();
        // Logged out: no reading list button, but a login link
        await expect(page.getByRole('button', { name: /leeslijst/ })).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();

        await page.getByRole('link', { name: '← Terug naar de catalogus' }).click();
        await expect(page).toHaveURL('/boeken');
    });

    test('logged out users do not get the reading list hearts', async ({ page }) => {
        await page.goto('/boeken');
        await expect(page.getByRole('button', { name: /leeslijst$/ })).toHaveCount(0);
    });
});

test.describe('Foutpagina', () => {
    test('unknown book shows the 404 page', async ({ page }) => {
        const response = await page.goto('/boeken/bestaat-niet');
        expect(response?.status()).toBe(404);
        await expect(page.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeVisible();

        await page.getByRole('link', { name: 'Naar de homepage' }).click();
        await expect(page).toHaveURL('/');
    });

    test('unknown route shows the 404 page', async ({ page }) => {
        await page.goto('/deze-pagina-bestaat-niet');
        await expect(page.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeVisible();
    });
});

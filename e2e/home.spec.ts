import { expect, test } from './fixtures';

test('logged out visitors are invited to register', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Bookie · Leesadvies dat bij je past');
    await page.getByRole('link', { name: 'Maak een account aan' }).click();
    await expect(page).toHaveURL('/registreren');
});

test('the advice carousel can be paused and navigated', async ({ page }) => {
    await page.goto('/');
    const carousel = page.getByRole('region', { name: 'Boekadvies' });
    const pause = carousel.getByRole('button', { name: 'Pauzeer carrousel' });
    await pause.click();
    await expect(carousel.getByRole('button', { name: 'Start carrousel' })).toBeVisible();

    const dot2 = carousel.getByRole('button', { name: 'Ga naar dia 2' });
    await carousel.getByRole('button', { name: 'Volgende' }).click();
    await expect(dot2).toHaveAttribute('aria-current', 'true');
    await carousel.getByRole('button', { name: 'Vorige' }).click();
    await expect(carousel.getByRole('button', { name: 'Ga naar dia 1' })).toHaveAttribute(
        'aria-current',
        'true'
    );
});

test('the main nav links work', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation').first();

    await nav.getByRole('link', { name: 'Catalogus' }).click();
    await expect(page).toHaveURL('/boeken');
    await expect(nav.getByRole('link', { name: 'Catalogus' })).toHaveAttribute(
        'aria-current',
        'page'
    );

    await nav.getByRole('link', { name: 'Advies' }).click();
    await expect(page).toHaveURL('/advies');
    await expect(page.getByRole('link', { name: 'Inloggen' }).first()).toBeVisible();
});

test('the skip link moves focus to the main content', async ({ page, browserName, isMobile }) => {
    test.skip(isMobile, 'No keyboard on mobile');
    // Safari only tabs to links when "Press Tab to highlight each item" is enabled
    test.skip(browserName === 'webkit', 'WebKit skips links when tabbing');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Naar de inhoud' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
});

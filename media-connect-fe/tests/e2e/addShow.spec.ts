import { test, expect } from '@playwright/test';

test.describe('Show Management Flow', () => {
    const showName = 'Breaking Bad';

    test('user can search for a show, add it, update it, and remove it', async ({ page }) => {
        // Step 1: Navigate to login/registration
        await page.goto('http://localhost:3000');

        // Fill in registration form
        await page.fill('input[name="email"]', 'test@gmail.com');
        await page.fill('input[name="password"]', 'testtest');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/dashboard/);

        // Navigate to search page
        await page.getByRole('link', { name: 'Search TV Shows', exact: true }).click();

        // Step 2: Search for a show
        await page.fill('input[placeholder="Search for TV shows... (e.g., Stranger Things)"]', showName);
        await page.click('button:has-text("Search")');

        // Wait for search results to load
        const showCard = page.locator('h4', { hasText: /^Breaking Bad$/ });
        await expect(showCard).toBeVisible();
        await showCard.click();

        // Step 3: Verify we're on the show detail page
        await expect(page.locator('h1')).toContainText(showName);

        // Step 4: Add the show to my-shows
        await page.click('button:has-text("Save Show")');
        await expect(page.locator('text=Saved')).toBeVisible();

        // Step 5: Navigate to /my-shows
        await page.goto('http://localhost:3000/my-shows');
        await expect(page).toHaveURL(/my-shows/);
        await expect(page.locator(`text=${showName}`)).toBeVisible();

        // Step 6: Update the show (change rating and status)
        await page.click('button:has-text("Edit")');

        // Fill in update form
        await page.fill('input[type="number"]', '9');
        await page.getByLabel('Watch Status').selectOption('completed');

        // Save changes
        await page.click('button:has-text("Save")');

        // Verify the changes were saved
        await expect(page.locator('text=9')).toBeVisible();

        // Step 7: Remove the show
        // Set up dialog handler BEFORE clicking remove
        page.once('dialog', dialog => dialog.accept());

        await page.click('button:has-text("Remove")');

        // Wait for the show card to disappear from the DOM
        await expect(page.locator('h3', { hasText: showName })).not.toBeVisible();
    });
});
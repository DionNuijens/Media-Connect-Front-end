import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
    test('should register a new user', async ({ page }) => {
        // Navigate to your Next.js app
        await page.goto('http://localhost:3000');

        // Fill in registration form
        await page.fill('input[name="email"]', 'test@gmail.com');
        await page.fill('input[name="password"]', 'testtest');

        // Submit form
        await page.click('button[type="submit"]');

        // Verify success (check for redirect or success message)
        await expect(page).toHaveURL('http://localhost:3000/dashboard');
    });
});
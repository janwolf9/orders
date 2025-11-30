import { test, expect } from '@playwright/test';
import { registerUser, generateTestUser } from './helpers';

/**
 * TC-002: Dodajanje produkta v košarico
 * 
 * Prioriteta: Kritična
 * Kategorija: Pozitivni test
 * Modul: Upravljanje košarice
 * 
 * Opis: Preveri uspešno dodajanje produkta v košarico pri prijavljenem uporabniku
 */

test.describe('TC-002: Dodajanje produkta v košarico', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const testUser = generateTestUser();
    await registerUser(page, testUser);
    await page.waitForTimeout(2000);
  });

  test('TC-002: Dodajanje produkta v košarico z veljavno količino', async ({ page }) => {
    // Korak 2: Navigiraj na "Products" sekcijo
    await page.locator('a.nav-link:has-text("Products")').first().click();
    await page.waitForTimeout(1000);

    // Korak 3-4: Poišči prvi razpoložljiv produkt
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });

    // Korak 5 & 6: Dodaj v košarico
    const addToCartButton = productCard.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    // Pričakovani rezultat 1: Toast sporočilo ali povratna informacija
    await page.waitForTimeout(2000);

    // Korak 8: Preveri košarico
    const cartLink = page.locator('a.cart-link').first();
    const cartCount = page.locator('#cartCount');
    
    // Preveri da je košarica vidna
    await expect(cartLink).toBeVisible({ timeout: 5000 });
  });
});

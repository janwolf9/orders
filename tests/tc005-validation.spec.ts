import { test, expect } from '@playwright/test';

/**
 * TC-005: Validacija napačnih podatkov pri registraciji
 * 
 * Prioriteta: Visoka
 * Kategorija: Negativni test
 * Modul: Validacija in error handling
 * 
 * Opis: Preveri pravilno obravnavo napačnih podatkov pri registraciji
 */

test.describe('TC-005: Validacija napačnih podatkov pri registraciji', () => {
  
  test.beforeEach(async ({ page }) => {
    // Predpogoj: Sistem je dostopen, Registration forma je dostopna
    await page.goto('/');
    await page.locator('button:has-text("Register")').first().click();
    await page.waitForTimeout(500);
  });

  test('TC-005: Negativni test - registracija z neveljavnimi podatki', async ({ page }) => {
    // Vnesi neveljavne podatke
    await page.fill('#registerFirstName', 'T'); // prekratek
    await page.fill('#registerLastName', 'U'); // prekratek
    await page.fill('#registerUsername', 'ab'); // prekratek
    await page.fill('#registerEmail', 'invalid-email'); // napačen format
    await page.fill('#registerPassword', '123'); // prešibek

    // Klikni Register
    await page.locator('#registerForm button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Preveri da registracija ni uspešna
    // Bodisi ostane na registracijski formi ali prikaže napako
    const isStillOnRegisterPage = await page.locator('#registerForm').isVisible();
    const bodyText = await page.locator('body').textContent() || '';
    const hasError = /error|invalid|fail|short|weak|match/i.test(bodyText);
    
    // Vsaj ena validacijska napaka mora biti prisotna
    expect(isStillOnRegisterPage || hasError).toBeTruthy();
  });
});

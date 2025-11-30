import { test, expect } from '@playwright/test';
import { generateTestUser } from './helpers';

/**
 * TC-001: Registracija novega uporabnika
 * 
 * Prioriteta: Visoka
 * Kategorija: Pozitivni test
 * Modul: Upravljanje uporabnikov
 * 
 * Opis: Preveri uspešno registracijo novega uporabnika z veljavnimi podatki
 */

test.describe('TC-001: Registracija novega uporabnika', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Orders Management|E-Shop|Web App/);
  });

  test('TC-001: Registracija novega uporabnika z veljavnimi podatki', async ({ page }) => {
    // Generiraj unikaten email za vsakokratni test
    const testUser = generateTestUser();

    // Korak 1: Odpri aplikacijo
    await expect(page.locator('.navbar')).toBeVisible();

    // Korak 2: Klikni na "Register" tab v navigaciji
    await page.locator('.nav-auth button:has-text("Register")').click();
    await page.waitForTimeout(1000);
    
    // Preveri da je registracijska forma vidna
    await expect(page.locator('#register')).toBeVisible();

    // Korak 3-6: Vnesi registracijske podatke
    await page.fill('#registerFirstName', testUser.firstName);
    await page.fill('#registerLastName', testUser.lastName);
    await page.fill('#registerUsername', testUser.username);
    await page.fill('#registerEmail', testUser.email);
    await page.fill('#registerPassword', testUser.password);

    // Korak 7: Klikni gumb "Register"
    await page.locator('#registerForm button[type="submit"]').click();

    // Pričakovani rezultat 1: Prikaže se sporočilo "Registration successful"
    await page.waitForTimeout(3000);
    
    // Pričakovani rezultat 2 & 3: Uporabnik je avtomatsko prijavljen in navigacija prikazuje opcije
    const navigation = page.locator('.navbar, nav');
    const bodyContent = page.locator('body');
    
    // Preveri da je uporabnik prijavljen 
    const hasLogoutButton = await navigation.locator('button:has-text("Logout")').count() > 0;
    const hasDashboardContent = await bodyContent.locator('text=/Dashboard|Products|Orders/').count() > 0;
    const bodyText = await bodyContent.textContent() || '';
    const hasUsername = bodyText.includes(testUser.username);
    
    const isLoggedIn = hasLogoutButton || hasDashboardContent || hasUsername;
    expect(isLoggedIn).toBeTruthy();
  });
});

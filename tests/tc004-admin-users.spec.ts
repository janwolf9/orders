import { test, expect } from '@playwright/test';
import { loginUser } from './helpers';

/**
 * TC-004: Upravljanje uporabnikov (Admin funkcionalnost)
 * 
 * Prioriteta: Srednja
 * Kategorija: Pozitivni test
 * Modul: Admin panel
 * 
 * Opis: Preveri admin funkcionalnost za pregled in upravljanje vseh uporabnikov
 */

test.describe('TC-004: Upravljanje uporabnikov (Admin funkcionalnost)', () => {
  
  const adminCredentials = {
    email: 'jan.wolf9@gmail.com',
    password: 'janwolf9'
  };

  test.beforeEach(async ({ page }) => {
    // Predpogoj: Admin uporabnik je prijavljen
    await page.goto('/');
    await loginUser(page, adminCredentials);
  });

  test('TC-004: Admin pregled in upravljanje uporabnikov', async ({ page }) => {
    // Počakaj, da se navbar posodobi po prijavi
    await page.waitForTimeout(2000);
    
    // 1. Navigacija na Admin sekcijo
    const adminLink = page.locator('a.nav-link:has-text("Admin")');
    await expect(adminLink).toBeVisible({ timeout: 5000 });
    await adminLink.click();
    
    // 2. Preveri, da je Admin sekcija vidna
    await expect(page.locator('#admin')).toBeVisible();
    
    // 3. Klikni na User Management tab
    const userManagementTab = page.locator('.admin-tab:has-text("User Management")');
    await expect(userManagementTab).toBeVisible();
    await userManagementTab.click();
    await page.waitForTimeout(1000);
    
    // 4. Preveri, da je User Management tab aktiven
    await expect(page.locator('#adminUsersTab')).toBeVisible();
    
    // 5. Preveri prisotnost search polja
    const searchInput = page.locator('#userSearchInput');
    await expect(searchInput).toBeVisible();
    
    // 6. Testiranje iskanja uporabnika
    await searchInput.fill('test');
    await page.waitForTimeout(1500);
    
    // 7. Preveri, da je tabela uporabnikov vidna
    const usersTable = page.locator('#adminUsersTable');
    await expect(usersTable).toBeVisible();
    
    // 8. Počisti search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // Test uspešen - admin lahko dostopa do user management
    expect(true).toBeTruthy();
  });
});

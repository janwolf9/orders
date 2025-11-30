import { Page } from '@playwright/test';

export async function registerUser(page: Page, user: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}) {

  const registerButton = page.locator('button:has-text("Register")').first();
  if (await registerButton.isVisible()) {
    await registerButton.click();
    await page.waitForTimeout(500);
  }

  await page.fill('#registerFirstName', user.firstName);
  await page.fill('#registerLastName', user.lastName);
  await page.fill('#registerUsername', user.username);
  await page.fill('#registerEmail', user.email);
  await page.fill('#registerPassword', user.password);

  await page.locator('#registerForm button[type="submit"]').click();
  await page.waitForTimeout(2000);
}

export async function loginUser(page: Page, credentials: {
  email: string;
  password: string;
}) {

  const loginButton = page.locator('button:has-text("Login")').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForTimeout(500);
  }

  await page.fill('#loginEmail', credentials.email);
  await page.fill('#loginPassword', credentials.password);

  await page.locator('#loginForm button[type="submit"]').click();
  await page.waitForTimeout(2000);
}

export function generateTestUser() {
  const timestamp = Date.now();
  return {
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPass123'
  };
}
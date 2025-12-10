"""
Helper functions for Selenium tests
"""
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def generate_test_user():
    """Generate unique test user data"""
    timestamp = int(time.time() * 1000)
    return {
        'firstName': 'Test',
        'lastName': 'User',
        'username': f'testuser{timestamp}',
        'email': f'test{timestamp}@example.com',
        'password': 'TestPass123'
    }


def register_user(driver, user):
    """Register a new user"""
    wait = WebDriverWait(driver, 10)
    
    # Click Register button if visible
    try:
        register_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]"))
        )
        register_button.click()
        time.sleep(0.5)
    except:
        pass
    
    # Fill registration form
    wait.until(EC.visibility_of_element_located((By.ID, 'registerFirstName')))
    driver.find_element(By.ID, 'registerFirstName').send_keys(user['firstName'])
    driver.find_element(By.ID, 'registerLastName').send_keys(user['lastName'])
    driver.find_element(By.ID, 'registerUsername').send_keys(user['username'])
    driver.find_element(By.ID, 'registerEmail').send_keys(user['email'])
    driver.find_element(By.ID, 'registerPassword').send_keys(user['password'])
    
    # Submit form
    submit_button = driver.find_element(By.CSS_SELECTOR, '#registerForm button[type="submit"]')
    submit_button.click()
    time.sleep(2)


def login_user(driver, email, password):
    """Login existing user"""
    wait = WebDriverWait(driver, 10)
    
    # Click Login button if visible
    try:
        login_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Login')]"))
        )
        login_button.click()
        time.sleep(0.5)
    except:
        pass
    
    # Fill login form
    wait.until(EC.visibility_of_element_located((By.ID, 'loginEmail')))
    driver.find_element(By.ID, 'loginEmail').send_keys(email)
    driver.find_element(By.ID, 'loginPassword').send_keys(password)
    
    # Submit form
    submit_button = driver.find_element(By.CSS_SELECTOR, '#loginForm button[type="submit"]')
    submit_button.click()
    time.sleep(2)

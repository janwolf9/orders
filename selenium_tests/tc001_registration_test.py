"""
TC-001: Registracija novega uporabnika
Selenium version

Prioriteta: Visoka
Kategorija: Pozitivni test
Modul: Upravljanje uporabnikov

Opis: Preveri uspešno registracijo novega uporabnika z veljavnimi podatki
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from helpers import generate_test_user, register_user


class TestTC001Registration:
    """Test class for user registration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup browser before each test"""
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.driver.maximize_window()
        self.base_url = "http://localhost:8080"
        yield
        self.driver.quit()
    
    def test_tc001_registration_with_valid_data(self):
        """TC-001: Registracija novega uporabnika z veljavnimi podatki"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
        # Generate unique test user
        test_user = generate_test_user()
        
        # Korak 1: Odpri aplikacijo
        driver.get(self.base_url)
        
        # Verify page title
        assert any(keyword in driver.title for keyword in ['Orders Management', 'E-Shop', 'Web App'])
        
        # Verify navbar is visible
        navbar = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, 'navbar')))
        assert navbar.is_displayed()
        
        # Korak 2: Klikni na "Register" tab v navigaciji
        register_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Register')]")
        register_button.click()
        time.sleep(1)
        
        # Preveri da je registracijska forma vidna
        register_section = wait.until(EC.visibility_of_element_located((By.ID, 'register')))
        assert register_section.is_displayed()
        
        # Korak 3-6: Vnesi registracijske podatke
        driver.find_element(By.ID, 'registerFirstName').send_keys(test_user['firstName'])
        driver.find_element(By.ID, 'registerLastName').send_keys(test_user['lastName'])
        driver.find_element(By.ID, 'registerUsername').send_keys(test_user['username'])
        driver.find_element(By.ID, 'registerEmail').send_keys(test_user['email'])
        driver.find_element(By.ID, 'registerPassword').send_keys(test_user['password'])
        
        # Korak 7: Klikni gumb "Register"
        submit_button = driver.find_element(By.CSS_SELECTOR, '#registerForm button[type="submit"]')
        submit_button.click()
        
        # Pričakovani rezultat 1, 2 & 3: Uspešna registracija in prijava
        time.sleep(3)
        
        # Preveri da je uporabnik prijavljen
        body_text = driver.find_element(By.TAG_NAME, 'body').text
        
        # Check for logout button, dashboard content, or username
        has_logout = len(driver.find_elements(By.XPATH, "//button[contains(text(), 'Logout')]")) > 0
        has_dashboard = 'Dashboard' in body_text or 'Products' in body_text or 'Orders' in body_text
        has_username = test_user['username'] in body_text
        
        is_logged_in = has_logout or has_dashboard or has_username
        
        assert is_logged_in, "User should be logged in after successful registration"
        
        print(f"✅ TC-001 PASSED: User {test_user['username']} registered successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--html=report_tc001.html", "--self-contained-html"])

"""
TC-005: Validacija napačnih podatkov pri registraciji
Selenium version

Prioriteta: Visoka
Kategorija: Negativni test
Modul: Validacija in error handling

Opis: Preveri pravilno obravnavo neveljavnih podatkov pri registraciji
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestTC005Validation:
    """Test class for data validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup browser before each test"""
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.driver.maximize_window()
        self.base_url = "http://localhost:8080"
        yield
        self.driver.quit()
    
    def test_tc005_registration_with_invalid_data(self):
        """TC-005: Negativni test - registracija z neveljavnimi podatki"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
        # Korak 1: Odpri aplikacijo
        driver.get(self.base_url)
        
        # Korak 2: Klikni na Register
        register_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]"))
        )
        register_button.click()
        time.sleep(1)
        
        # Preveri da je registracijska forma vidna
        wait.until(EC.visibility_of_element_located((By.ID, 'register')))
        
        # Korak 3-7: Vnesi neveljavne podatke
        driver.find_element(By.ID, 'registerFirstName').send_keys('T')  # Prekratko ime (1 znak)
        driver.find_element(By.ID, 'registerLastName').send_keys('U')  # Prekratek priimek (1 znak)
        driver.find_element(By.ID, 'registerUsername').send_keys('ab')  # Prekratko uporabniško ime (2 znaka)
        driver.find_element(By.ID, 'registerEmail').send_keys('invalid-email')  # Napačen email format
        driver.find_element(By.ID, 'registerPassword').send_keys('123')  # Prešibko geslo (3 znaki)
        
        # Korak 8: Poskusi oddati formo
        submit_button = driver.find_element(By.CSS_SELECTOR, '#registerForm button[type="submit"]')
        submit_button.click()
        time.sleep(2)
        
        # Pričakovani rezultat: Forma prikazuje error sporočila ali ostane na isti strani
        # Check if still on register page or error message visible
        register_section = driver.find_element(By.ID, 'register')
        is_register_visible = register_section.is_displayed()
        
        # Check for error messages
        error_elements = driver.find_elements(By.CSS_SELECTOR, '.alert-error, .error-message, .alert-danger')
        has_errors = len(error_elements) > 0
        
        # Should either stay on form or show error
        assert is_register_visible or has_errors, "Should show error or stay on registration form with invalid data"
        
        print("✅ TC-005 PASSED: Invalid data validation working correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--html=report_tc005.html", "--self-contained-html"])

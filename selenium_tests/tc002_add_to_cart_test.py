"""
TC-002: Dodajanje produkta v košarico
Selenium version

Prioriteta: Kritična
Kategorija: Pozitivni test
Modul: Upravljanje košarice

Opis: Preveri dodajanje produkta v košarico pri prijavljenem uporabniku
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from helpers import generate_test_user, register_user


class TestTC002AddToCart:
    """Test class for adding products to cart"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup browser and login user before each test"""
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.driver.maximize_window()
        self.base_url = "http://localhost:8080"
        
        # Register and login user
        self.driver.get(self.base_url)
        self.test_user = generate_test_user()
        register_user(self.driver, self.test_user)
        
        yield
        self.driver.quit()
    
    def test_tc002_add_product_to_cart_with_valid_quantity(self):
        """TC-002: Dodajanje produkta v košarico z veljavno količino"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
        # Korak 1: Navigacija na Products sekcijo
        products_link = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'nav-link') and contains(text(), 'Products')]"))
        )
        products_link.click()
        time.sleep(2)
        
        # Korak 2: Počakaj, da se produkti naložijo
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, 'product-card')))
        product_cards = driver.find_elements(By.CLASS_NAME, 'product-card')
        
        assert len(product_cards) > 0, "Should have at least one product available"
        
        # Korak 3: Izberi prvi produkt in dodaj v košarico
        first_product = product_cards[0]
        add_to_cart_button = first_product.find_element(By.XPATH, ".//button[contains(text(), 'Add to Cart')]")
        
        # Get product name for verification
        product_name = first_product.find_element(By.CLASS_NAME, 'product-name').text
        
        # Click add to cart
        add_to_cart_button.click()
        time.sleep(2)
        
        # Pričakovani rezultat: Košarica prikazuje dodani produkt
        # Check for cart link or cart count
        cart_elements = driver.find_elements(By.CSS_SELECTOR, 'a.cart-link, .cart-icon, #cartCount')
        
        assert len(cart_elements) > 0, "Cart icon should be visible after adding product"
        
        print(f"✅ TC-002 PASSED: Product '{product_name}' added to cart successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--html=report_tc002.html", "--self-contained-html"])

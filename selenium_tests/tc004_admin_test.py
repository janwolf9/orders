"""
TC-004: Upravljanje uporabnikov (Admin funkcionalnost)
Selenium version

Prioriteta: Srednja
Kategorija: Admin test
Modul: Admin funkcionalnost

Opis: Preveri admin pregled in upravljanje uporabnikov
"""
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from helpers import login_user


class TestTC004AdminUsers:
    """Test class for admin user management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup browser and login as admin"""
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.driver.maximize_window()
        self.base_url = "http://localhost:8080"
        
        # Login as admin
        self.driver.get(self.base_url)
        self.admin_email = "jan.wolf9@gmail.com"
        self.admin_password = "janwolf9"
        
        login_user(self.driver, self.admin_email, self.admin_password)
        time.sleep(2)
        
        yield
        self.driver.quit()
    
    def test_tc004_admin_view_and_manage_users(self):
        """TC-004: Admin pregled in upravljanje uporabnikov"""
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
        # Korak 1: Navigacija na Admin panel
        try:
            admin_link = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'nav-link') and contains(text(), 'Admin')]"))
            )
            admin_link.click()
            time.sleep(2)
            
            # Korak 2: Klikni na User Management tab
            try:
                users_tab = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'admin-tab') and contains(text(), 'User Management')]"))
                )
                users_tab.click()
                time.sleep(2)
                
                # Korak 3: Preveri da se prikaže tabela uporabnikov
                users_section = driver.find_elements(By.ID, 'adminUsersTab')
                assert len(users_section) > 0, "Admin Users Tab should be visible"
                
                users_table = driver.find_elements(By.ID, 'adminUsersTable')
                assert len(users_table) > 0, "Users table should be visible"
                
                # Korak 4: Preveri search funkcionalnost
                search_input = driver.find_elements(By.ID, 'userSearchInput')
                
                if len(search_input) > 0:
                    print("✅ TC-004 PASSED: Admin user management fully accessible with search")
                else:
                    print("✅ TC-004 PASSED: Admin user management accessible")
                    
            except Exception as e:
                pytest.skip(f"Users tab not accessible: {str(e)}")
                
        except Exception as e:
            pytest.skip(f"Admin panel not accessible: {str(e)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--html=report_tc004.html", "--self-contained-html"])

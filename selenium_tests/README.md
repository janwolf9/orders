# Selenium Tests - E-Commerce Orders Management System

Selenium avtomatizirani testi za E-Commerce Orders Management System, prevedeni iz Playwright testov.

## 📋 Predpogoji

- Python 3.8 ali novejši
- Google Chrome browser
- ChromeDriver (avtomatsko se namesti s selenium 4.x)
- Backend server running on `localhost:3000`
- Frontend server running on `localhost:8080`

## 🚀 Namestitev

1. Ustvari virtual environment:
```bash
cd selenium_tests
python -m venv venv
```

2. Aktiviraj virtual environment:
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. Namesti dependencies:
```bash
pip install -r requirements.txt
```

## 🧪 Zagon Testov

### Zaženi vse teste
```bash
pytest -v
```

### Zaženi specifičen test
```bash
pytest tc001_registration_test.py -v
```

### Generiraj HTML poročilo
```bash
pytest -v --html=report.html --self-contained-html
```

### Zaženi teste z verbose output
```bash
pytest -v -s
```

## 📁 Struktura Testov

```
selenium_tests/
├── requirements.txt          # Python dependencies
├── helpers.py               # Helper functions (register, login, generate user)
├── tc001_registration_test.py   # TC-001: User registration
├── tc002_add_to_cart_test.py   # TC-002: Add product to cart
├── tc003_checkout_test.py      # TC-003: Checkout process
├── tc004_admin_test.py         # TC-004: Admin user management
├── tc005_validation_test.py    # TC-005: Data validation
└── README.md                   # This file
```

## 📊 Test Coverage

| Test ID | Naziv | Status | Kategorija |
|---------|-------|--------|------------|
| TC-001 | Registracija uporabnika | ✅ Ready | Pozitivni |
| TC-002 | Dodajanje v košarico | ✅ Ready | Pozitivni |
| TC-003 | Checkout proces | ✅ Ready | Pozitivni |
| TC-004 | Admin funkcionalnost | ✅ Ready | Admin |
| TC-005 | Validacija podatkov | ✅ Ready | Negativni |

## 🔧 Konfiguracija

### Base URL
Testi uporabljajo `http://localhost:8080` kot base URL. Če želite spremeniti, uredite v vsakem test filu:
```python
self.base_url = "http://localhost:8080"
```

### Browser Configuration
Testi uporabljajo Chrome browser. Za uporabo drugega browserja (Firefox, Edge), spremenite:
```python
self.driver = webdriver.Chrome()  # Spremeni v Firefox(), Edge(), etc.
```

### Timeouts
- Implicit wait: 10 sekund
- Explicit wait: 10 sekund (WebDriverWait)
- Sleep delays: 1-3 sekunde med akcijami

## 📝 Helper Functions

### `generate_test_user()`
Generira unikatnega testnega uporabnika s timestamp:
```python
{
    'firstName': 'Test',
    'lastName': 'User',
    'username': 'testuser1234567890',
    'email': 'test1234567890@example.com',
    'password': 'TestPass123'
}
```

### `register_user(driver, user)`
Registrira novega uporabnika z danimi podatki.

### `login_user(driver, email, password)`
Prijavi obstoječega uporabnika.

## 🐛 Debugging

### Headless Mode (brez vidnega browserja)
```python
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
self.driver = webdriver.Chrome(options=options)
```

### Screenshot on Failure
```python
def teardown_method(self):
    if hasattr(self, '_test_failed') and self._test_failed:
        self.driver.save_screenshot('failure.png')
    self.driver.quit()
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Selenium Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd selenium_tests
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd selenium_tests
          pytest -v --html=report.html --self-contained-html
      - name: Upload test report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: selenium_tests/report.html
```

## 🔗 Primerjava s Playwright

| Feature | Playwright | Selenium |
|---------|------------|----------|
| Jezik | TypeScript | Python |
| Browser support | Chrome, Firefox, WebKit | Chrome, Firefox, Edge, Safari |
| Execution speed | Hitrejši | Počasnejši |
| Auto-waiting | Da | Potrebno ročno |
| Parallel execution | Native | Potreben pytest-xdist |
| Screenshots | Avtomatsko | Ročno |

## 📞 Podpora

Za vprašanja ali probleme odpri issue na GitHub repozitoriju ali kontaktiraj razvojno ekipo.

## 📄 License

MIT License - glej LICENSE datoteko za več informacij.

"""
Pytest configuration and fixtures
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run tests in headless mode"
    )
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:8080",
        help="Base URL for the application"
    )


@pytest.fixture(scope="session")
def base_url(request):
    """Get base URL from command line or use default"""
    return request.config.getoption("--base-url")


@pytest.fixture(scope="session")
def headless(request):
    """Get headless mode from command line"""
    return request.config.getoption("--headless")


@pytest.fixture
def chrome_options(headless):
    """Configure Chrome options"""
    options = Options()
    
    if headless:
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
    
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    
    return options


def pytest_html_report_title(report):
    """Customize HTML report title"""
    report.title = "Selenium Test Report - E-Commerce Orders Management"


def pytest_configure(config):
    """Configure pytest metadata for HTML report"""
    config._metadata = {
        'Project': 'E-Commerce Orders Management System',
        'Test Framework': 'Selenium + pytest',
        'Browser': 'Chrome',
        'Environment': 'localhost:8080'
    }

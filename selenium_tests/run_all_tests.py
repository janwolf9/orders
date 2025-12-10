"""
Run all Selenium tests
"""
import sys
import pytest

if __name__ == "__main__":
    # Run all tests with HTML report
    exit_code = pytest.main([
        "-v",
        "--html=test_report.html",
        "--self-contained-html",
        "--tb=short"
    ])
    
    sys.exit(exit_code)

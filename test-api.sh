#!/bin/bash

# API Test Script for E-commerce Web Application
echo "=== Testing E-commerce Web Application API ==="
echo

BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo
echo

# Test 2: User Registration
echo -e "${YELLOW}2. Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Registration successful - Token obtained${NC}"
else
    echo -e "${RED}✗ Registration failed - No token received${NC}"
fi
echo
echo

# Test 3: User Login (alternative user)
echo -e "${YELLOW}3. Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Use login token if registration didn't work
if [ -z "$TOKEN" ]; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null)
fi
echo
echo

# Test 4: Create Product (if we have a token)
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}4. Testing Product Creation...${NC}"
    PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "Test Laptop",
        "description": "A powerful laptop for testing purposes",
        "price": 999.99,
        "category": "electronics",
        "brand": "TestBrand",
        "stock": 10,
        "tags": ["laptop", "computer", "electronics"]
      }')
    
    echo "$PRODUCT_RESPONSE" | python3 -m json.tool
    
    # Extract product ID
    PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('product', {}).get('_id', ''))" 2>/dev/null)
    echo
    echo

    # Test 5: Get Products with Search
    echo -e "${YELLOW}5. Testing Product Search...${NC}"
    curl -s "$BASE_URL/products?search=laptop&category=electronics" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo
    echo

    # Test 6: Create Order (if we have a product)
    if [ -n "$PRODUCT_ID" ]; then
        echo -e "${YELLOW}6. Testing Order Creation...${NC}"
        ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d "{
            \"items\": [{
              \"product\": \"$PRODUCT_ID\",
              \"quantity\": 1
            }],
            \"shippingAddress\": {
              \"street\": \"123 Test St\",
              \"city\": \"Test City\",
              \"postalCode\": \"12345\",
              \"country\": \"Slovenia\"
            },
            \"billingAddress\": {
              \"street\": \"123 Test St\",
              \"city\": \"Test City\",
              \"postalCode\": \"12345\",
              \"country\": \"Slovenia\"
            },
            \"paymentMethod\": \"credit_card\",
            \"notes\": \"Test order from API\"
          }")
        
        echo "$ORDER_RESPONSE" | python3 -m json.tool
        
        ORDER_ID=$(echo "$ORDER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('order', {}).get('_id', ''))" 2>/dev/null)
        echo
        echo

        # Test 7: Create Review
        echo -e "${YELLOW}7. Testing Review Creation...${NC}"
        curl -s -X POST "$BASE_URL/reviews" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d "{
            \"product\": \"$PRODUCT_ID\",
            \"rating\": 5,
            \"title\": \"Excellent laptop!\",
            \"comment\": \"This laptop exceeded my expectations. Great performance and build quality.\"
          }" | python3 -m json.tool
        echo
        echo

        # Test 8: Get User Orders
        echo -e "${YELLOW}8. Testing Get User Orders...${NC}"
        curl -s "$BASE_URL/orders" \
          -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
        echo
        echo
    fi

    # Test 9: Get User Profile
    echo -e "${YELLOW}9. Testing Get User Profile...${NC}"
    curl -s "$BASE_URL/auth/me" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo
    echo

else
    echo -e "${RED}Skipping authenticated tests - No token available${NC}"
fi

# Test 10: Get Public Products (no auth required)
echo -e "${YELLOW}10. Testing Public Product Listing...${NC}"
curl -s "$BASE_URL/products?limit=5" | python3 -m json.tool
echo
echo

echo -e "${GREEN}=== API Testing Complete ===${NC}"
echo
echo "Application URLs:"
echo "• Backend API: http://localhost:3000"
echo "• Frontend: http://localhost:3001"
echo "• API Documentation: Check README.md for detailed endpoints"
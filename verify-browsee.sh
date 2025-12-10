#!/bin/bash

# Browsee Integration Verification Script
# This script helps verify that Browsee tracking is properly implemented

echo "=========================================="
echo "Browsee Integration Verification"
echo "=========================================="
echo ""

# Check if Browsee script exists in HTML
echo "1. Checking Browsee script in index.html..."
if grep -q "_browsee('init'" frontend/index.html; then
    PROJECT_ID=$(grep "_browsee('init'" frontend/index.html | sed -n "s/.*_browsee('init', '\([^']*\)'.*/\1/p")
    echo "✅ Browsee script found with project ID: $PROJECT_ID"
else
    echo "❌ Browsee script NOT found in index.html"
    exit 1
fi
echo ""

# Check tracking functions in script.js
echo "2. Checking tracking functions in script.js..."
TRACK_FUNCTION=$(grep -c "function trackBrowseeEvent" frontend/script.js)
IDENTIFY_FUNCTION=$(grep -c "function identifyBrowseeUser" frontend/script.js)

if [ "$TRACK_FUNCTION" -eq 1 ] && [ "$IDENTIFY_FUNCTION" -eq 1 ]; then
    echo "✅ Tracking helper functions found"
else
    echo "❌ Tracking helper functions missing"
    exit 1
fi
echo ""

# Count tracking calls
echo "3. Counting Browsee tracking calls..."
TRACK_CALLS=$(grep -c "trackBrowseeEvent(" frontend/script.js)
IDENTIFY_CALLS=$(grep -c "identifyBrowseeUser(" frontend/script.js)

echo "   - trackBrowseeEvent() calls: $TRACK_CALLS"
echo "   - identifyBrowseeUser() calls: $IDENTIFY_CALLS"
echo ""

# List all tracked events
echo "4. Tracked events:"
grep "trackBrowseeEvent('" frontend/script.js | sed "s/.*trackBrowseeEvent('\([^']*\)'.*/   - \1/" | sort -u
echo ""

# Check if BROWSEE_INTEGRATION.md exists
echo "5. Checking documentation..."
if [ -f "BROWSEE_INTEGRATION.md" ]; then
    echo "✅ BROWSEE_INTEGRATION.md documentation exists"
    WORD_COUNT=$(wc -w < BROWSEE_INTEGRATION.md)
    echo "   Documentation size: $WORD_COUNT words"
else
    echo "❌ BROWSEE_INTEGRATION.md documentation missing"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary:"
echo "=========================================="
echo "✅ Browsee script embedded: YES"
echo "✅ Project ID configured: $PROJECT_ID"
echo "✅ Helper functions: 2/2"
echo "✅ Tracking calls: $TRACK_CALLS"
echo "✅ User identification calls: $IDENTIFY_CALLS"
echo ""
echo "Total events tracked: $(grep "trackBrowseeEvent('" frontend/script.js | sed "s/.*trackBrowseeEvent('\([^']*\)'.*/\1/" | sort -u | wc -l)"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Start backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. Start frontend server:"
echo "   cd frontend && python3 -m http.server 8080"
echo ""
echo "3. Open browser console and test events:"
echo "   - Register new user"
echo "   - Login"
echo "   - Browse products"
echo "   - Add to cart"
echo "   - Search"
echo "   - Checkout"
echo "   - Logout"
echo ""
echo "4. Verify in Browsee dashboard:"
echo "   https://app.browsee.io/"
echo ""
echo "=========================================="

#!/bin/bash

# Math API Test Script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"

echo "=== Math API Test Script ==="
echo "Testing Math API endpoints..."
echo

# 1. Test login to get JWT token
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}')

echo "Login Response: $LOGIN_RESPONSE"
echo

# Extract token from response (requires jq for JSON parsing)
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    echo "Extracted Token: ${TOKEN:0:50}..."
else
    echo "jq not found. Please install jq to automatically extract token."
    echo "Or manually copy the token from the login response above."
    echo "Usage: TOKEN='your_jwt_token_here'"
    echo
    echo "To install jq on macOS: brew install jq"
    exit 1
fi

echo

# 2. Test GET endpoint - Basic calculation
echo "2. Testing GET /math/calculate (addition)..."
curl -s -X GET "$BASE_URL/math/calculate?operation=add&a=10&b=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo

echo "3. Testing GET /math/calculate (division)..."
curl -s -X GET "$BASE_URL/math/calculate?operation=divide&a=15&b=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo

# 4. Test POST endpoint - Array operations
echo "4. Testing POST /math/calculate (sum array)..."
curl -s -X POST "$BASE_URL/math/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operation": "sum", "numbers": [1, 2, 3, 4, 5]}' | jq '.'
echo

echo "5. Testing POST /math/calculate (average)..."
curl -s -X POST "$BASE_URL/math/calculate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operation": "average", "numbers": [10, 20, 30, 40, 50]}' | jq '.'
echo

# 6. Test PUT endpoint - Power operation
echo "6. Testing PUT /math/power..."
curl -s -X PUT "$BASE_URL/math/power" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"base": 2, "exponent": 8}' | jq '.'
echo

# 7. Test additional GET endpoint - Factorial
echo "7. Testing GET /math/factorial..."
curl -s -X GET "$BASE_URL/math/factorial?n=7" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo

# 8. Test error handling - Unauthorized request
echo "8. Testing unauthorized request (no token)..."
curl -s -X GET "$BASE_URL/math/calculate?operation=add&a=1&b=2" | jq '.'
echo

# 9. Test root endpoint
echo "9. Testing root endpoint..."
curl -s -X GET "$BASE_URL/" | jq '.'
echo

echo "=== Test Complete ==="
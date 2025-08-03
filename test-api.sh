#!/bin/bash

echo "🧪 Testing Hexagonal Architecture DDD API with Kafka"
echo "=================================================="

# Test 1: Create an order
echo ""
echo "📦 Test 1: Creating a new order..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "productId": "product-456",
        "quantity": 2,
        "price": 29.99,
        "currency": "EUR"
      },
      {
        "productId": "product-789",
        "quantity": 1,
        "price": 15.50
      }
    ]
  }')

echo "✅ Order created:"
echo "$ORDER_RESPONSE" | jq '.'

# Extract order ID for next test
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.orderId')

# Test 2: Get the created order
echo ""
echo "📋 Test 2: Retrieving the created order..."
curl -s http://localhost:3000/orders/$ORDER_ID | jq '.'

# Test 3: Try to get a non-existent order
echo ""
echo "❌ Test 3: Trying to get a non-existent order..."
curl -s http://localhost:3000/orders/non-existent-id

# Test 4: Create order with validation error
echo ""
echo "🚫 Test 4: Creating order with validation error..."
curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "",
    "items": []
  }'

echo ""
echo "🎉 API Testing completed!"
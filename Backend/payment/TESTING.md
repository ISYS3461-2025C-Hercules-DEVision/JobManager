# Payment Service - Testing Guide

## Overview
The Payment Service is a **shared microservice** used by both **Job Manager (JM)** and **Job Applicant (JA)** subsystems. It handles payment processing through Stripe integration with automatic callback routing to appropriate services.

**Port:** 8084  
**MongoDB:** 27021  
**Dependencies:** Stripe SDK, WebClient, Kafka, JWT Authentication

---

## Architecture

### Subsystem Routing
The Payment Service supports multiple subsystems through the `subsystem` field:
- **JOB_MANAGER**: Company subscription payments → callbacks to Subscription Service
- **JOB_APPLICANT**: Applicant feature payments → callbacks to JA service (TBD)

### Payment Types
- **SUBSCRIPTION**: Recurring subscription payments (JM)
- **PREMIUM_FEATURE**: One-time premium feature purchase (JA)
- **ONE_TIME**: Other one-time payments

### Payment Flow
1. Frontend calls `POST /payments/initiate` → Creates Stripe Checkout Session
2. User redirects to Stripe → Completes payment
3. Stripe redirects back → Frontend calls `GET /payments/complete`
4. Payment Service verifies payment → Routes callback to appropriate service
5. Subscription/Feature activated → Kafka events published

---

## API Endpoints

### 1. Initiate Payment
**Endpoint:** `POST /payments/initiate`  
**Authentication:** JWT required  
**Description:** Creates a Stripe Checkout Session and returns checkout URL.

**Request Body:**
```json
{
  "subsystem": "JOB_MANAGER",
  "paymentType": "SUBSCRIPTION",
  "customerId": "company123",
  "email": "company@example.com",
  "referenceId": "subscription123",
  "amount": 3000,
  "currency": "USD",
  "description": "Premium Subscription - 1 Month"
}
```

**Response:**
```json
{
  "transactionId": "txn_abc123",
  "stripeSessionId": "cs_test_abc123",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_abc123",
  "expiresAt": "2024-01-15T14:30:00Z"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8084/payments/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subsystem": "JOB_MANAGER",
    "paymentType": "SUBSCRIPTION",
    "customerId": "company123",
    "email": "company@example.com",
    "referenceId": "subscription123",
    "amount": 3000,
    "currency": "USD",
    "description": "Premium Subscription - 1 Month"
  }'
```

---

### 2. Complete Payment
**Endpoint:** `GET /payments/complete?sessionId={sessionId}`  
**Authentication:** JWT required  
**Description:** Completes payment after Stripe redirect, triggers callbacks.

**Query Parameters:**
- `sessionId`: Stripe session ID from success URL

**Response:**
```json
{
  "transactionId": "txn_abc123",
  "subsystem": "JOB_MANAGER",
  "paymentType": "SUBSCRIPTION",
  "customerId": "company123",
  "email": "company@example.com",
  "referenceId": "subscription123",
  "amount": 3000,
  "currency": "USD",
  "gateway": "STRIPE",
  "status": "SUCCESS",
  "stripeSessionId": "cs_test_abc123",
  "stripePaymentIntentId": "pi_abc123",
  "timestamp": "2024-01-15T13:45:00Z"
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:8084/payments/complete?sessionId=cs_test_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Payment by ID
**Endpoint:** `GET /payments/{transactionId}`  
**Authentication:** JWT required  
**Description:** Retrieve payment details by transaction ID.

**Response:** Same as Complete Payment

**Example cURL:**
```bash
curl -X GET http://localhost:8084/payments/txn_abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Customer Payment History
**Endpoint:** `GET /payments/customer/{customerId}`  
**Authentication:** JWT required  
**Description:** Retrieve all payments for a specific customer.

**Response:**
```json
[
  {
    "transactionId": "txn_abc123",
    "subsystem": "JOB_MANAGER",
    "paymentType": "SUBSCRIPTION",
    "customerId": "company123",
    "amount": 3000,
    "status": "SUCCESS",
    "timestamp": "2024-01-15T13:45:00Z"
  },
  {
    "transactionId": "txn_def456",
    "subsystem": "JOB_MANAGER",
    "paymentType": "SUBSCRIPTION",
    "customerId": "company123",
    "amount": 3000,
    "status": "SUCCESS",
    "timestamp": "2023-12-15T10:30:00Z"
  }
]
```

**Example cURL:**
```bash
curl -X GET http://localhost:8084/payments/customer/company123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Get All Payments (Admin)
**Endpoint:** `GET /payments`  
**Authentication:** JWT required (Admin role)  
**Description:** Retrieve all payments in the system.

**Example cURL:**
```bash
curl -X GET http://localhost:8084/payments \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

### 6. Stripe Webhook
**Endpoint:** `POST /payments/webhook`  
**Authentication:** Stripe signature verification  
**Description:** Handles server-side payment confirmations from Stripe.

**Supported Events:**
- `checkout.session.completed`: Payment successfully completed
- `payment_intent.succeeded`: Payment intent succeeded
- `payment_intent.payment_failed`: Payment failed

**Example Webhook Configuration:**
```bash
stripe listen --forward-to localhost:8084/payments/webhook
```

---

## Testing Scenarios

### Scenario 1: Company Upgrades to Premium (JM)
**Steps:**
1. Company creates PREMIUM subscription → Status: PENDING
2. Company initiates payment through Payment Service
3. Stripe Checkout Session created → User redirects to Stripe
4. User completes payment on Stripe
5. Payment Service completes payment → Calls Subscription Service
6. Subscription Service activates subscription → Status: ACTIVE
7. Kafka event triggers Company Service → isPremium = true

**Test Script:**
```bash
# Step 1: Create subscription (via Subscription Service)
SUBSCRIPTION_ID=$(curl -X POST http://localhost:8083/subscriptions \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "company123",
    "planType": "PREMIUM",
    "billingEmail": "billing@company.com"
  }' | jq -r '.id')

# Step 2: Initiate payment
PAYMENT_RESPONSE=$(curl -X POST http://localhost:8084/payments/initiate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subsystem": "JOB_MANAGER",
    "paymentType": "SUBSCRIPTION",
    "customerId": "company123",
    "email": "billing@company.com",
    "referenceId": "'$SUBSCRIPTION_ID'",
    "amount": 3000,
    "currency": "USD",
    "description": "Premium Subscription - 1 Month"
  }')

CHECKOUT_URL=$(echo $PAYMENT_RESPONSE | jq -r '.checkoutUrl')
SESSION_ID=$(echo $PAYMENT_RESPONSE | jq -r '.stripeSessionId')

echo "Checkout URL: $CHECKOUT_URL"
echo "Visit the URL to complete payment"

# Step 3: After payment, complete the transaction
curl -X GET "http://localhost:8084/payments/complete?sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Step 4: Verify subscription activated
curl -X GET "http://localhost:8083/subscriptions/$SUBSCRIPTION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Scenario 2: Applicant Purchases Premium Feature (JA)
**Steps:**
1. Applicant initiates payment for premium feature
2. Stripe Checkout Session created
3. User completes payment
4. Payment Service completes payment → Calls JA service (TBD)
5. JA service activates feature → Kafka event published

**Test Script:**
```bash
# Initiate payment for JA premium feature
PAYMENT_RESPONSE=$(curl -X POST http://localhost:8084/payments/initiate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subsystem": "JOB_APPLICANT",
    "paymentType": "PREMIUM_FEATURE",
    "customerId": "applicant456",
    "email": "applicant@example.com",
    "referenceId": "feature789",
    "amount": 1500,
    "currency": "USD",
    "description": "Resume Review Service"
  }')

CHECKOUT_URL=$(echo $PAYMENT_RESPONSE | jq -r '.checkoutUrl')
SESSION_ID=$(echo $PAYMENT_RESPONSE | jq -r '.stripeSessionId')

# Complete payment after checkout
curl -X GET "http://localhost:8084/payments/complete?sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## Kafka Events

### payment-initiated
**Published when:** Stripe Checkout Session created  
**Payload:**
```json
{
  "transactionId": "txn_abc123",
  "subsystem": "JOB_MANAGER",
  "paymentType": "SUBSCRIPTION",
  "customerId": "company123",
  "referenceId": "subscription123",
  "amount": 3000,
  "currency": "USD",
  "status": "PENDING",
  "timestamp": "2024-01-15T13:30:00Z"
}
```

### payment-success
**Published when:** Payment successfully completed  
**Payload:**
```json
{
  "transactionId": "txn_abc123",
  "subsystem": "JOB_MANAGER",
  "paymentType": "SUBSCRIPTION",
  "customerId": "company123",
  "referenceId": "subscription123",
  "amount": 3000,
  "currency": "USD",
  "status": "SUCCESS",
  "timestamp": "2024-01-15T13:45:00Z"
}
```

### payment-failed
**Published when:** Payment fails  
**Payload:**
```json
{
  "transactionId": "txn_abc123",
  "subsystem": "JOB_MANAGER",
  "paymentType": "SUBSCRIPTION",
  "customerId": "company123",
  "referenceId": "subscription123",
  "amount": 3000,
  "currency": "USD",
  "status": "FAILED",
  "timestamp": "2024-01-15T13:40:00Z"
}
```

---

## Integration Points

### Subscription Service (JM)
**Endpoint:** `PUT http://localhost:8083/subscriptions/{id}/activate?paymentId={paymentId}`  
**Called when:** JOB_MANAGER payment succeeds  
**Purpose:** Activate pending subscription  
**Authentication:** JWT token forwarded from original request

### Job Applicant Service (JA)
**Endpoint:** TBD by JA team  
**Called when:** JOB_APPLICANT payment succeeds  
**Purpose:** Activate purchased feature  
**Authentication:** JWT token forwarded from original request

---

## Configuration

### Stripe Setup
1. Create Stripe account: https://dashboard.stripe.com/register
2. Get API keys from Dashboard → Developers → API keys
3. Set environment variables:
   ```bash
   STRIPE_API_KEY=sk_test_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### Webhook Testing
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8084/payments/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## Error Handling

### Common Errors

**Invalid JWT Token:**
```json
{
  "error": "Invalid or expired token"
}
```
**Status:** 401 Unauthorized

**Invalid Payment Request:**
```json
{
  "error": "Subsystem must be JOB_MANAGER or JOB_APPLICANT"
}
```
**Status:** 400 Bad Request

**Payment Not Found:**
```json
{}
```
**Status:** 404 Not Found

**Stripe API Error:**
```json
{
  "error": "Failed to create checkout session: Card declined"
}
```
**Status:** 500 Internal Server Error

---

## Security Considerations

1. **JWT Validation**: All endpoints require valid JWT token
2. **Webhook Signature**: Stripe webhooks verified using signing secret
3. **HTTPS Only**: Production must use HTTPS for Stripe integration
4. **PCI Compliance**: No card data stored (handled by Stripe Checkout)
5. **Rate Limiting**: Consider implementing rate limits on payment endpoints
6. **Idempotency**: Webhook handler should be idempotent to prevent duplicate processing

---

## Monitoring and Logging

### Key Metrics to Monitor
- Payment success rate
- Average payment completion time
- Failed payment reasons
- Webhook processing latency
- Callback success rate (to Subscription/JA services)

### Important Logs
- Payment initiation: `Payment initiation request for subsystem: {}, type: {}`
- Payment completion: `Payment completed successfully. Transaction ID: {}`
- Callback success: `Successfully called Subscription Service to activate subscription`
- Webhook events: `Webhook signature verified. Event type: {}`
- Errors: All exceptions logged with stack traces

---

## Development Notes

### Local Testing with Stripe
1. Use Stripe test mode keys (starting with `sk_test_` and `pk_test_`)
2. Test card numbers: `4242 4242 4242 4242` (Visa success)
3. Expiry: Any future date
4. CVC: Any 3 digits
5. ZIP: Any 5 digits

### MongoDB Setup
```bash
# Start MongoDB for Payment Service
docker run -d -p 27021:27017 --name payment-mongo mongo:latest
```

### Running the Service
```bash
cd Backend/payment
./gradlew bootRun
```

### Verifying Service Health
```bash
# Check Eureka registration
curl http://localhost:8761/eureka/apps/PAYMENT-SERVICE

# Check webhook health
curl http://localhost:8084/payments/webhook/health
```

---

## Future Enhancements

1. **Refund Support**: Add refund processing endpoints
2. **Payment Plans**: Support for installment payments
3. **Multiple Gateways**: Add PayPal, Razorpay integration
4. **Retry Logic**: Automatic retry for failed callbacks
5. **Payment Analytics**: Dashboard for payment metrics
6. **Subscription Renewal**: Automatic renewal processing
7. **Discount Codes**: Coupon and promotion support

---

## Support

For issues or questions:
- Payment Service: Check logs in `Backend/payment/logs/`
- Stripe Dashboard: https://dashboard.stripe.com/test/payments
- Webhook Logs: https://dashboard.stripe.com/test/webhooks
- Team Contact: backend-team@jobmanager.com

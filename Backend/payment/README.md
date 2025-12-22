# Payment Service

## Overview
The Payment Service is a **shared microservice** handling payment processing for both **Job Manager (JM)** and **Job Applicant (JA)** subsystems. It integrates with Stripe for secure payment processing and automatically routes callbacks to appropriate services based on the subsystem.

**Version:** 1.0.0  
**Port:** 8084  
**Database:** MongoDB (Port 27021)  
**Spring Boot:** 3.3.4  
**Java:** 21

---

## Features

### Core Capabilities
- ✅ Stripe Checkout Session integration (PCI-compliant)
- ✅ Multi-subsystem support (JM and JA)
- ✅ Multiple payment types (Subscription, Premium Feature, One-Time)
- ✅ Automatic callback routing to appropriate services
- ✅ Kafka event publishing for payment lifecycle
- ✅ JWT authentication and authorization
- ✅ Webhook handling for server-side payment confirmation
- ✅ Payment history and transaction tracking

### Payment Flow
```
Frontend → Payment Service → Stripe Checkout
                ↓
          Stripe Payment
                ↓
     Payment Service Webhook
                ↓
        Callback Routing
      ↙              ↘
Subscription      JA Service
  Service           (TBD)
```

---

## Architecture

### Subsystem Routing
The Payment Service uses a **subsystem field** to route payments and callbacks:

| Subsystem      | Payment Type       | Callback Target           | Purpose                    |
|----------------|--------------------|--------------------------|-----------------------------|
| JOB_MANAGER    | SUBSCRIPTION       | Subscription Service     | Company subscription upgrade|
| JOB_APPLICANT  | PREMIUM_FEATURE    | JA Service (TBD)         | Applicant feature purchase  |
| Both           | ONE_TIME           | Custom logic             | One-time payments           |

### Key Components

**Entity Layer:**
- `PaymentTransaction`: Payment transaction entity with Stripe details
  - Subsystem routing (JOB_MANAGER | JOB_APPLICANT)
  - Payment types (SUBSCRIPTION | PREMIUM_FEATURE | ONE_TIME)
  - Payment status tracking (PENDING | SUCCESS | FAILED | REFUNDED | CANCELLED)

**Service Layer:**
- `PaymentService`: Business logic orchestration and callback routing
- `StripePaymentService`: Stripe SDK integration and session management
- `PaymentEventProducer`: Kafka event publishing

**Controller Layer:**
- `PaymentController`: REST API endpoints for payment operations
- `StripeWebhookController`: Webhook handler for Stripe events

**Integration Layer:**
- `WebClient`: HTTP client for inter-service communication
- `JwtUtil`: JWT token validation
- `KafkaConfig`: Kafka producer configuration

---

## API Endpoints

### Payment Operations
```
POST   /payments/initiate        - Create Stripe checkout session
GET    /payments/complete        - Complete payment after Stripe redirect
GET    /payments/{transactionId} - Get payment details
GET    /payments/customer/{id}   - Get customer payment history
GET    /payments                 - Get all payments (admin)
GET    /payments/cancel          - Handle payment cancellation
```

### Webhooks
```
POST   /payments/webhook         - Stripe webhook handler
GET    /payments/webhook/health  - Webhook health check
```

See [TESTING.md](TESTING.md) for detailed API documentation and examples.

---

## Configuration

### Application Properties
```yaml
server:
  port: 8084

spring:
  application:
    name: payment-service
  data:
    mongodb:
      host: localhost
      port: 27021
      database: paymentdb

stripe:
  api:
    key: ${STRIPE_API_KEY:sk_test_your_secret_key}
  webhook:
    secret: ${STRIPE_WEBHOOK_SECRET:whsec_your_webhook_secret}
  success:
    url: ${STRIPE_SUCCESS_URL:http://localhost:3000/payment/success}
  cancel:
    url: ${STRIPE_CANCEL_URL:http://localhost:3000/payment/cancel}

kafka:
  bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
  payment:
    initiated:
      topic: payment-initiated
    success:
      topic: payment-success
    failed:
      topic: payment-failed

services:
  subscription:
    base-url: ${SUBSCRIPTION_SERVICE_URL:http://localhost:8083}
```

### Environment Variables
```bash
# Required
STRIPE_API_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional (with defaults)
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
SUBSCRIPTION_SERVICE_URL=http://localhost:8083
```

---

## Getting Started

### Prerequisites
- Java 21
- MongoDB 27021
- Kafka (localhost:9092)
- Stripe Account (test mode)
- Eureka Server (localhost:8761)

### Installation

1. **Start Dependencies**
   ```bash
   # Start MongoDB
   docker run -d -p 27021:27017 --name payment-mongo mongo:latest
   
   # Start Kafka (via docker-compose in Backend/)
   cd Backend
   docker-compose up -d
   
   # Start Eureka (Discovery Service)
   cd Backend/discovery
   ./gradlew bootRun
   ```

2. **Configure Stripe**
   ```bash
   # Get your Stripe test keys from: https://dashboard.stripe.com/test/apikeys
   export STRIPE_API_KEY=sk_test_your_secret_key
   
   # Setup webhook endpoint and get secret
   stripe listen --forward-to localhost:8084/payments/webhook
   export STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Build and Run**
   ```bash
   cd Backend/payment
   ./gradlew clean build
   ./gradlew bootRun
   ```

4. **Verify Service**
   ```bash
   # Check service health
   curl http://localhost:8084/payments/webhook/health
   
   # Check Eureka registration
   curl http://localhost:8761/eureka/apps/PAYMENT-SERVICE
   ```

---

## Integration Guide

### For Job Manager (JM) Team

**Creating Company Subscription Payment:**
```java
// Step 1: Create PREMIUM subscription (Subscription Service)
SubscriptionRequestDTO subscriptionRequest = new SubscriptionRequestDTO(
    "company123",
    "PREMIUM",
    "billing@company.com"
);
// POST /subscriptions → Returns subscription with status=PENDING

// Step 2: Initiate payment (Payment Service)
PaymentInitiateRequestDTO paymentRequest = new PaymentInitiateRequestDTO();
paymentRequest.setSubsystem("JOB_MANAGER");
paymentRequest.setPaymentType("SUBSCRIPTION");
paymentRequest.setCustomerId("company123");
paymentRequest.setEmail("billing@company.com");
paymentRequest.setReferenceId(subscriptionId); // From step 1
paymentRequest.setAmount(3000L); // $30.00 in cents
paymentRequest.setCurrency("USD");
paymentRequest.setDescription("Premium Subscription - 1 Month");

// POST /payments/initiate → Returns checkoutUrl
// Redirect user to checkoutUrl

// Step 3: After payment, complete transaction
// GET /payments/complete?sessionId={sessionId}
// Payment Service automatically calls Subscription Service to activate
```

**What Happens Automatically:**
1. Payment Service completes payment
2. Calls `PUT /subscriptions/{id}/activate?paymentId={paymentId}`
3. Subscription status changes to ACTIVE
4. Kafka event published: `subscription-activated`
5. Company Service updates `isPremium=true`

---

### For Job Applicant (JA) Team

**Creating Premium Feature Payment:**
```java
// Step 1: Initiate payment for premium feature
PaymentInitiateRequestDTO paymentRequest = new PaymentInitiateRequestDTO();
paymentRequest.setSubsystem("JOB_APPLICANT");
paymentRequest.setPaymentType("PREMIUM_FEATURE");
paymentRequest.setCustomerId("applicant456");
paymentRequest.setEmail("applicant@example.com");
paymentRequest.setReferenceId("feature789"); // Your feature ID
paymentRequest.setAmount(1500L); // $15.00 in cents
paymentRequest.setCurrency("USD");
paymentRequest.setDescription("Resume Review Service");

// POST /payments/initiate → Returns checkoutUrl
// Redirect user to checkoutUrl

// Step 2: After payment, complete transaction
// GET /payments/complete?sessionId={sessionId}
```

**TODO: JA Team Must Implement:**
Create an endpoint to receive payment success callback:
```java
@PutMapping("/features/{featureId}/activate")
public ResponseEntity<?> activateFeature(
        @PathVariable String featureId,
        @RequestParam String paymentId,
        @RequestHeader("Authorization") String token) {
    
    // Validate payment
    // Activate feature for applicant
    // Return success response
}
```

Update `PaymentService.handleJobApplicantPaymentSuccess()` with your endpoint:
```java
String jaServiceUrl = "http://localhost:8085/features/" + 
        payment.getReferenceId() + 
        "/activate?paymentId=" + payment.getTransactionId();
```

---

## Kafka Integration

### Events Published

**payment-initiated**
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

**payment-success**
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

**payment-failed**
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

### Consuming Events
```java
@KafkaListener(topics = "payment-success", groupId = "your-service")
public void handlePaymentSuccess(PaymentEventDTO event) {
    // Handle successful payment
    if ("JOB_MANAGER".equals(event.getSubsystem())) {
        // Update company premium status
    }
}
```

---

## Database Schema

### PaymentTransaction Collection
```javascript
{
  "_id": "txn_abc123",
  "transactionId": "txn_abc123",
  "subsystem": "JOB_MANAGER",           // JOB_MANAGER | JOB_APPLICANT
  "paymentType": "SUBSCRIPTION",        // SUBSCRIPTION | PREMIUM_FEATURE | ONE_TIME
  "customerId": "company123",           // companyId or applicantId
  "email": "billing@company.com",
  "referenceId": "subscription123",     // subscriptionId, featureId, etc.
  "amount": 3000,                       // Amount in cents
  "currency": "USD",
  "gateway": "STRIPE",                  // STRIPE | PAYPAL
  "status": "SUCCESS",                  // PENDING | SUCCESS | FAILED | REFUNDED | CANCELLED
  "stripeSessionId": "cs_test_abc123",
  "stripePaymentIntentId": "pi_abc123",
  "rawGatewayReference": "{...}",       // Raw Stripe response
  "timestamp": ISODate("2024-01-15T13:45:00Z"),
  "_class": "com.job.manager.payment.entity.PaymentTransaction"
}
```

### Indexes
```javascript
db.paymentTransaction.createIndex({ "stripeSessionId": 1 }, { unique: true })
db.paymentTransaction.createIndex({ "customerId": 1 })
db.paymentTransaction.createIndex({ "referenceId": 1 })
db.paymentTransaction.createIndex({ "status": 1 })
db.paymentTransaction.createIndex({ "subsystem": 1, "status": 1 })
```

---

## Security

### Authentication
- All endpoints require valid JWT token in `Authorization` header
- JWT validated using public key from Authentication Service
- Token forwarded to callback services for authorization

### Stripe Security
- Webhook signatures verified using Stripe signing secret
- API keys stored as environment variables (never committed)
- Test mode keys used in development (prefix: `sk_test_`)
- Production must use HTTPS for Stripe communication

### PCI Compliance
- No card data stored or processed directly
- Stripe Checkout handles all card information
- Redirect-based payment flow (no card input in app)
- Payment Service only stores Stripe references

---

## Error Handling

### Common Issues

**Issue:** "Invalid or expired token"
- **Cause:** JWT token invalid or expired
- **Solution:** Refresh token from Authentication Service

**Issue:** "Unable to create checkout session"
- **Cause:** Invalid Stripe API key or insufficient balance
- **Solution:** Verify `STRIPE_API_KEY` environment variable

**Issue:** "Subscription activation failed"
- **Cause:** Subscription Service unreachable or subscription not found
- **Solution:** Check Subscription Service logs, verify referenceId

**Issue:** "Webhook signature verification failed"
- **Cause:** Invalid webhook secret
- **Solution:** Update `STRIPE_WEBHOOK_SECRET` from Stripe CLI or Dashboard

---

## Monitoring and Logs

### Key Metrics
- Total payments processed
- Payment success rate by subsystem
- Average payment amount
- Failed payment reasons
- Callback success rate

### Log Locations
```
Backend/payment/logs/
├── application.log       - General application logs
├── payment.log          - Payment-specific logs
└── error.log            - Error logs
```

### Important Log Messages
```
INFO  - Payment initiation request for subsystem: JOB_MANAGER, type: SUBSCRIPTION
INFO  - Payment initiated successfully. Transaction ID: txn_abc123
INFO  - Checkout session completed: cs_test_abc123, payment status: paid
INFO  - Payment completed successfully. Transaction ID: txn_abc123
INFO  - Successfully called Subscription Service to activate subscription
ERROR - Failed to call Subscription Service: Connection refused
```

---

## Testing

See [TESTING.md](TESTING.md) for:
- API endpoint examples
- Test scenarios for JM and JA
- Stripe test card numbers
- Webhook testing with Stripe CLI
- Integration testing scripts

---

## Development

### Project Structure
```
payment/
├── src/main/java/com/job/manager/payment/
│   ├── PaymentApplication.java           - Main application
│   ├── entity/
│   │   └── PaymentTransaction.java       - Payment entity
│   ├── repository/
│   │   └── PaymentTransactionRepository.java
│   ├── dto/
│   │   ├── PaymentInitiateRequestDTO.java
│   │   ├── PaymentInitiateResponseDTO.java
│   │   ├── PaymentResponseDTO.java
│   │   └── PaymentEventDTO.java
│   ├── service/
│   │   ├── PaymentService.java           - Business logic
│   │   └── StripePaymentService.java     - Stripe integration
│   ├── controller/
│   │   ├── PaymentController.java        - REST API
│   │   └── StripeWebhookController.java  - Webhooks
│   ├── kafka/
│   │   └── PaymentEventProducer.java     - Kafka producer
│   ├── config/
│   │   ├── KafkaConfig.java              - Kafka config
│   │   └── WebClientConfig.java          - HTTP client
│   └── util/
│       └── JwtUtil.java                  - JWT validation
├── src/main/resources/
│   └── application.yml                   - Configuration
├── build.gradle                          - Dependencies
├── README.md                             - This file
└── TESTING.md                            - Testing guide
```

### Dependencies
```gradle
// Spring Boot
implementation 'org.springframework.boot:spring-boot-starter-web'
implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
implementation 'org.springframework.boot:spring-boot-starter-webflux'

// Stripe
implementation 'com.stripe:stripe-java:24.4.0'

// Kafka
implementation 'org.springframework.kafka:spring-kafka'

// JWT
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'

// Eureka
implementation 'org.springframework.cloud:spring-cloud-starter-netflix-eureka-client'
```

---

## Contributing

### Code Standards
- Follow Java naming conventions
- Write comprehensive JavaDoc comments
- Include unit tests for new features
- Update TESTING.md with new endpoints

### Commit Message Format
```
feat: add refund processing endpoint
fix: resolve webhook signature verification issue
docs: update API documentation with new examples
test: add integration tests for JA payment flow
```

---

## Support and Contact

**Team:** Backend Development Team  
**Service Owner:** Payment Team  
**Documentation:** [TESTING.md](TESTING.md)  
**Issue Tracker:** GitHub Issues  
**Stripe Dashboard:** https://dashboard.stripe.com/test

---

## Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Initial release
- ✅ Stripe Checkout Session integration
- ✅ Multi-subsystem support (JM and JA)
- ✅ Kafka event publishing
- ✅ Webhook handling
- ✅ Callback routing to Subscription Service
- ✅ JWT authentication
- ✅ Payment history and tracking

### Planned Features
- 🔄 Refund processing
- 🔄 PayPal integration
- 🔄 Payment analytics dashboard
- 🔄 Automatic subscription renewal
- 🔄 Discount code support

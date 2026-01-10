# 📬 NOTIFICATION SERVICE - DEVELOPER HANDOFF DOCUMENT

**Service Name:** `notification`  
**Port:** 8084 (default local), Dynamic in production  
**Database:** MongoDB (`mongodb-notification`, Port: 27021)  
**Version:** 0.0.1-SNAPSHOT  
**Java Version:** 21  
**Spring Boot:** 3.3.4  
**Last Updated:** January 9, 2026

---

## 📋 TABLE OF CONTENTS

1. [Service Overview](#service-overview)
2. [Current Implementation Status](#current-implementation-status)
3. [Architecture & Design](#architecture--design)
4. [Codebase Structure](#codebase-structure)
5. [Key Components](#key-components)
6. [Kafka Integration](#kafka-integration)
7. [Email System](#email-system)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Configuration](#configuration)
11. [Known Issues & Bugs](#known-issues--bugs)
12. [Dependencies](#dependencies)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Sprint 3 Tasks](#sprint-3-tasks)
16. [Developer Notes](#developer-notes)

---

## 🎯 SERVICE OVERVIEW

### Purpose
The Notification Service is responsible for:
- **Real-time applicant matching notifications** to companies
- **Email notifications** via Gmail SMTP
- **In-app notification center** for company users
- **Kafka event processing** for subscription and applicant events
- **Matching engine** to evaluate applicant-company compatibility

### Business Logic
When a new applicant profile is created or updated:
1. Notification Service receives Kafka event from Applicant Service
2. Matching Engine evaluates applicant against all active company search profiles
3. For each match found:
   - Save notification to MongoDB
   - Fetch company email via REST call to Authentication Service
   - Send email notification to company
4. Companies can view notifications in their dashboard

---

## ✅ CURRENT IMPLEMENTATION STATUS

### **COMPLETED FEATURES** ✅

| Feature | Status | Files |
|---------|--------|-------|
| **Applicant Matching Logic** | ✅ Complete | `MatchingEngine.java` |
| **Email Sending (SMTP)** | ✅ Complete | `NotificationService.java` |
| **MongoDB Notification Storage** | ✅ Complete | `Notification.java`, `NotificationRepository.java` |
| **Kafka Listeners** | ✅ Partial | `ApplicantProfileKafkaListener.java`, `NotificationKafkaListener.java` |
| **REST API - Get Notifications** | ✅ Complete | `NotificationController.java` |
| **Company Email Retrieval** | ✅ Complete | `CompanyEmailClient.java` |
| **Matching Criteria Retrieval** | ✅ Complete | `SubscriptionClient.java` |
| **Dockerfile** | ✅ Complete | `Dockerfile` |
| **Application Config** | ✅ Complete | `application.yml` |

### **PARTIALLY IMPLEMENTED FEATURES** ⚠️

| Feature | Status | Issues |
|---------|--------|--------|
| **Subscription Event Handling** | ⚠️ Listener exists, no business logic | `NotificationKafkaListener.java` - TODO comment on line 29 |
| **Logging** | ⚠️ Uses `System.out.println` instead of proper logger | Multiple SonarQube warnings |
| **Error Handling** | ⚠️ Basic try-catch, no retry mechanism | Email failures are silent |

### **NOT IMPLEMENTED FEATURES** ❌

| Feature | Status | Sprint 3 Task |
|---------|--------|---------------|
| **Job Update Notifications** | ❌ Not started | Issue #6 |
| **Real-time WebSocket Notifications** | ❌ Not started | Issue #10 |
| **Notification Read/Unread Tracking** | ❌ Not started | - |
| **Email Templates** | ❌ Uses plain text | - |
| **Retry Logic for Failed Emails** | ❌ Not started | - |
| **Health Check Endpoint** | ❌ Dockerfile has health check but service has no endpoint | - |

---

## 🏗️ ARCHITECTURE & DESIGN

### System Context

```
┌─────────────────┐      Kafka Topics           ┌──────────────────────┐
│ Applicant       │─────applicant.profile──────▶│  Notification        │
│ Service         │                              │  Service             │
└─────────────────┘                              │  (Port 8084)         │
                                                 │                      │
┌─────────────────┐      Kafka Topics           │  ┌────────────────┐  │
│ Subscription    │─────subscription.*──────────▶│  │ Kafka          │  │
│ Service         │   (created, activated, etc.) │  │ Listeners      │  │
└─────────────────┘                              │  └────────┬───────┘  │
                                                 │           │          │
┌─────────────────┐      REST API                │  ┌────────▼───────┐  │
│ Authentication  │◀──GET /users/{companyId}────│  │ Matching       │  │
│ Service         │    (Resolve email)           │  │ Engine         │  │
└─────────────────┘                              │  └────────┬───────┘  │
                                                 │           │          │
┌─────────────────┐      REST API                │  ┌────────▼───────┐  │
│ Subscription    │◀──GET /search-profiles──────│  │ Notification   │  │
│ Service         │    (Get company criteria)    │  │ Service        │  │
└─────────────────┘                              │  └────────┬───────┘  │
                                                 │           │          │
┌─────────────────┐      SMTP (587)              │           │          │
│ Gmail SMTP      │◀──────Send Email─────────────┤           │          │
│ smtp.gmail.com  │                              │           │          │
└─────────────────┘                              │  ┌────────▼───────┐  │
                                                 │  │ MongoDB        │  │
┌─────────────────┐      REST API                │  │ Repository     │  │
│ Frontend        │◀──GET /notifications/────────┤  └────────────────┘  │
│ (Company)       │    {companyId}               │                      │
└─────────────────┘                              └──────────────────────┘
                                                             │
                                                    ┌────────▼────────┐
                                                    │ MongoDB         │
                                                    │ Port: 27021     │
                                                    │ DB: notification│
                                                    └─────────────────┘
```

### Flow: Applicant Matching Notification

```
1. Applicant creates/updates profile
   │
   ▼
2. Applicant Service publishes Kafka event
   Topic: "applicant.profile"
   Payload: ApplicantCreatedEvent
   │
   ▼
3. ApplicantProfileKafkaListener receives event
   Consumer Group: "notification-matching-group"
   │
   ▼
4. SubscriptionClient fetches all active SearchProfiles
   GET http://subscription-service:8083/subscriptions/search-profiles
   │
   ▼
5. MatchingEngine evaluates applicant vs each profile
   Rules:
   - Country MUST match
   - Technical tags MUST have overlap
   - Employment status SHOULD overlap (if specified)
   - Salary ranges SHOULD overlap (if specified)
   - Education degree MUST match (if specified)
   │
   ▼
6. For each matching company:
   │
   ├─▶ Create Notification object
   │   └─ Save to MongoDB (notifications collection)
   │
   ├─▶ CompanyEmailClient fetches company email
   │   GET http://authentication-service:8080/auth/users/{companyId}
   │   Returns: UserDto { id, username (email) }
   │
   └─▶ Send email via Gmail SMTP
       From: SMTP_EMAIL
       To: company email
       Subject: "New matching applicant: {applicantName}"
       Body: "An applicant matching your criteria has been found: {applicantName}"
```

---

## 📁 CODEBASE STRUCTURE

```
Backend/notification/
├── build.gradle                        # Gradle build configuration
├── settings.gradle                     # Gradle settings
├── Dockerfile                          # Multi-stage Docker build
├── gradlew, gradlew.bat               # Gradle wrapper scripts
│
└── src/
    ├── main/
    │   ├── java/com/job/manager/notification/
    │   │   ├── NotificationApplication.java       # Main Spring Boot app + .env loader
    │   │   │
    │   │   ├── client/
    │   │   │   └── CompanyEmailClient.java        # REST client to Auth Service
    │   │   │
    │   │   ├── config/
    │   │   │   └── KafkaConfig.java               # Kafka consumer config (3 factories)
    │   │   │
    │   │   ├── controller/
    │   │   │   └── NotificationController.java    # REST API endpoints
    │   │   │
    │   │   ├── dto/
    │   │   │   ├── ApplicantMatchedEvent.java     # Event payload for matched applicants
    │   │   │   └── SubscriptionEventDTO.java      # Subscription lifecycle events
    │   │   │
    │   │   ├── kafka/
    │   │   │   └── NotificationKafkaListener.java # Subscription events listener
    │   │   │
    │   │   ├── matching/
    │   │   │   ├── dto/
    │   │   │   │   ├── ApplicantCreatedEvent.java       # Applicant profile event
    │   │   │   │   └── CompanySearchProfileDto.java     # Company search criteria
    │   │   │   │
    │   │   │   ├── kafka/
    │   │   │   │   └── ApplicantProfileKafkaListener.java   # Applicant events listener
    │   │   │   │
    │   │   │   └── service/
    │   │   │       ├── MatchingEngine.java         # Core matching algorithm
    │   │   │       └── SubscriptionClient.java     # REST client to Subscription Service
    │   │   │
    │   │   ├── model/
    │   │   │   └── Notification.java               # MongoDB entity
    │   │   │
    │   │   ├── repository/
    │   │   │   └── NotificationRepository.java     # MongoDB repository
    │   │   │
    │   │   └── service/
    │   │       └── NotificationService.java        # Business logic: save + email
    │   │
    │   └── resources/
    │       └── application.yml                     # Spring Boot config
    │
    └── test/
        └── java/com/job/manager/notification/
            └── NotificationApplicationTests.java   # Empty test class
```

---

## 🔑 KEY COMPONENTS

### 1. **NotificationApplication.java**

**Purpose:** Spring Boot entry point with custom .env loader

**Key Features:**
- Loads `.env` file using `dotenv-java` library
- **CRITICAL:** Normalizes `SMTP_PASSWORD` by removing spaces (Gmail app passwords have spaces)
- Logs SMTP configuration on startup for debugging

```java
@SpringBootApplication
public class NotificationApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        
        dotenv.entries().forEach(e -> {
            String key = e.getKey();
            String value = e.getValue();
            
            // Normalize SMTP password: remove spaces
            if ("SMTP_PASSWORD".equals(key) && value != null) {
                String normalized = value.replace(" ", "");
                System.setProperty(key, normalized);
            } else {
                System.setProperty(key, value);
            }
        });
        
        SpringApplication.run(NotificationApplication.class, args);
    }
}
```

**⚠️ Important Note:** This space-removal logic is CRITICAL. Gmail app passwords are formatted like `audr bfnw hzns cyvm` but SMTP requires `audrbfnwhznscyvm`.

---

### 2. **NotificationService.java**

**Purpose:** Core business logic for saving notifications and sending emails

**Responsibilities:**
1. Save notification to MongoDB
2. Resolve company email via CompanyEmailClient
3. Send email via JavaMailSender (Gmail SMTP)

**Key Method:**

```java
public void handleApplicantMatched(ApplicantMatchedEvent event) {
    // 1. Save notification to MongoDB
    Notification notification = Notification.builder()
            .companyId(event.getCompanyId())
            .applicantId(event.getApplicantId())
            .applicantName(event.getApplicantName())
            .subject("New matching applicant: " + event.getApplicantName())
            .message("An applicant matching your criteria has been found: " + event.getApplicantName())
            .read(false)
            .createdAt(Instant.now())
            .build();
    
    notificationRepository.save(notification);
    
    // 2. Resolve company email
    String email = resolveCompanyEmail(event.getCompanyId());
    
    // 3. Check SMTP configuration
    if (from == null || from.isBlank()) {
        System.out.println("SMTP not configured. Skipping email send.");
        return;
    }
    
    // 4. Send email
    try {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(email);
        mail.setSubject(notification.getSubject());
        mail.setText(notification.getMessage());
        
        mailSender.send(mail);
        System.out.println("SENT EMAIL to " + email);
    } catch (Exception ex) {
        System.out.println("FAILED to send email: " + ex.getMessage());
        ex.printStackTrace();
    }
}
```

**⚠️ Current Issues:**
- Uses `System.out.println` instead of logger (SonarQube warnings)
- Email failure doesn't throw exception (silent failure)
- No retry mechanism
- Plain text email only (no HTML templates)

---

### 3. **MatchingEngine.java**

**Purpose:** Algorithm to determine if an applicant matches a company's search profile

**Matching Rules (ALL must pass):**

| Rule | Priority | Logic |
|------|----------|-------|
| **Country Match** | MANDATORY | `applicant.country == profile.country` (case-insensitive) |
| **Technical Tags** | MANDATORY | At least ONE tag overlaps between applicant and profile |
| **Employment Status** | OPTIONAL | If profile specifies status, at least ONE must overlap |
| **Salary Range** | OPTIONAL | Applicant salary range overlaps with profile range |
| **Education Degree** | OPTIONAL | If profile specifies degree, MUST match exactly |

**Algorithm Complexity:** O(n * m) where n = number of search profiles, m = average tags per profile

**Code:**

```java
public boolean matches(ApplicantCreatedEvent applicant, CompanySearchProfileDto profile) {
    // 1. MANDATORY: Country must match
    if (applicant.getCountry() == null || profile.getCountry() == null) return false;
    if (!applicant.getCountry().equalsIgnoreCase(profile.getCountry())) return false;
    
    // 2. MANDATORY: At least one technical tag must overlap
    if (applicant.getTechnicalTags() == null || profile.getTechnicalTags() == null) return false;
    boolean hasTagOverlap = applicant.getTechnicalTags().stream()
            .anyMatch(tag -> profile.getTechnicalTags().stream()
                    .anyMatch(t -> t.equalsIgnoreCase(tag)));
    if (!hasTagOverlap) return false;
    
    // 3. OPTIONAL: Employment status overlap (if specified)
    if (profile.getEmploymentStatus() != null && !profile.getEmploymentStatus().isEmpty()) {
        Set<String> applicantStatuses = applicant.getEmploymentStatus() != null 
                ? applicant.getEmploymentStatus() : Set.of();
        Set<String> profileStatuses = new HashSet<>(profile.getEmploymentStatus());
        boolean statusOverlap = applicantStatuses.stream().anyMatch(profileStatuses::contains);
        if (!statusOverlap) return false;
    }
    
    // 4. OPTIONAL: Salary range overlap
    BigDecimal profileMin = profile.getSalaryMin() != null ? profile.getSalaryMin() : BigDecimal.ZERO;
    BigDecimal profileMax = profile.getSalaryMax();
    BigDecimal applicantMin = applicant.getExpectedSalaryMin();
    BigDecimal applicantMax = applicant.getExpectedSalaryMax();
    
    if (applicantMax != null && applicantMax.compareTo(profileMin) < 0) return false;
    if (profileMax != null && applicantMin != null && applicantMin.compareTo(profileMax) > 0) return false;
    
    // 5. OPTIONAL: Education degree (if specified)
    if (profile.getHighestEducationDegree() != null) {
        if (applicant.getHighestEducationDegree() == null) return false;
        if (!applicant.getHighestEducationDegree()
                .equalsIgnoreCase(profile.getHighestEducationDegree())) return false;
    }
    
    return true;
}
```

**⚠️ SonarQube Warning:** Cognitive Complexity 24 (max allowed: 15) - Needs refactoring

---

### 4. **ApplicantProfileKafkaListener.java**

**Purpose:** Kafka consumer for applicant profile events

**Kafka Configuration:**
- **Topic:** `applicant.profile`
- **Consumer Group:** `notification-matching-group`
- **Container Factory:** `applicantProfileKafkaListenerContainerFactory`

**Flow:**

```java
@KafkaListener(
    topics = "applicant.profile",
    groupId = "notification-matching-group",
    containerFactory = "applicantProfileKafkaListenerContainerFactory"
)
public void onApplicantCreated(ApplicantCreatedEvent event) {
    log.info("Notification(Matching): received applicant event: {}", event);
    
    // 1. Get all active company search profiles
    List<CompanySearchProfileDto> profiles = subscriptionClient.getAllSearchProfiles();
    
    // 2. Find matching companies
    List<String> matchedCompanyIds = matchingEngine.findMatchingCompanyIds(event, profiles);
    
    // 3. Send notification to each matched company
    for (String companyId : matchedCompanyIds) {
        ApplicantMatchedEvent matchedEvent = new ApplicantMatchedEvent();
        matchedEvent.setCompanyId(companyId);
        matchedEvent.setApplicantId(event.getApplicantId());
        matchedEvent.setApplicantName(event.getName());
        
        notificationService.handleApplicantMatched(matchedEvent);
    }
}
```

**⚠️ Production Considerations:**
- Currently processes ALL search profiles synchronously (could be slow)
- No pagination for search profiles
- No caching of search profiles

---

### 5. **NotificationKafkaListener.java**

**Purpose:** Kafka consumer for subscription lifecycle events

**Kafka Configuration:**
- **Topics:** `subscription.created`, `subscription.activated`, `subscription.expired`, `subscription.cancelled`, `subscription.expiring-soon`
- **Consumer Group:** `notification-group`
- **Container Factory:** `subscriptionKafkaListenerContainerFactory`

**⚠️ CURRENT STATUS: NOT IMPLEMENTED**

```java
@KafkaListener(
    topics = {
        "subscription.created",
        "subscription.activated",
        "subscription.expired",
        "subscription.cancelled",
        "subscription.expiring-soon"
    },
    groupId = "notification-group",
    containerFactory = "subscriptionKafkaListenerContainerFactory"
)
public void onSubscriptionEvent(SubscriptionEventDTO event) {
    System.out.println("NotificationKafkaListener: received subscription event: " + event);
    // TODO: Add logic here to handle different event types
    // e.g., notificationService.handleSubscriptionEvent(event);
}
```

**📝 TODO for Next Developer:**
- Implement email templates for each event type:
  - `CREATED`: "Welcome! Your subscription is now active"
  - `ACTIVATED`: "Your subscription has been activated"
  - `EXPIRING_SOON`: "Your subscription expires in 7 days"
  - `EXPIRED`: "Your subscription has expired"
  - `CANCELLED`: "Your subscription has been cancelled"

---

### 6. **CompanyEmailClient.java**

**Purpose:** REST client to fetch company email from Authentication Service

**API Call:**
- **Method:** GET
- **URL:** `{AUTH_URL}/users/{companyId}`
- **Response:** `UserDto { id, username }`

**Code:**

```java
@Component
public class CompanyEmailClient {
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${services.authentication.base-url}")
    private String authBaseUrl; // http://localhost:8080/auth
    
    public String getCompanyEmail(String companyId) {
        String url = authBaseUrl + "/users/" + companyId;
        UserDto user = restTemplate.getForObject(url, UserDto.class);
        
        if (user == null || user.getUsername() == null) {
            throw new IllegalStateException("Cannot resolve email for companyId=" + companyId);
        }
        
        return user.getUsername();
    }
    
    @Data
    public static class UserDto {
        private String id;
        private String username; // email
    }
}
```

**⚠️ Issues:**
- No error handling for network failures
- No retry logic
- No timeout configuration
- `RestTemplate` is synchronous (blocking)

**💡 Improvement Suggestions:**
- Use `WebClient` (reactive, non-blocking)
- Add `@Retryable` annotation with exponential backoff
- Add circuit breaker pattern (Resilience4j)

---

### 7. **SubscriptionClient.java**

**Purpose:** REST client to fetch all active company search profiles

**API Call:**
- **Method:** GET
- **URL:** `{SUBSCRIPTION_URL}/subscriptions/search-profiles`
- **Response:** `CompanySearchProfileDto[]`

**Code:**

```java
@Service
public class SubscriptionClient {
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${services.subscription.base-url:http://localhost:8083}")
    private String subscriptionBaseUrl;
    
    public List<CompanySearchProfileDto> getAllSearchProfiles() {
        String url = subscriptionBaseUrl + "/subscriptions/search-profiles";
        CompanySearchProfileDto[] profiles = 
                restTemplate.getForObject(url, CompanySearchProfileDto[].class);
        
        return profiles != null ? Arrays.asList(profiles) : List.of();
    }
}
```

**⚠️ Issues:**
- No pagination (fetches ALL profiles at once)
- No caching (queries every time an applicant is created)
- No error handling

**💡 Improvement Suggestions:**
- Add Redis caching with 5-minute TTL
- Add pagination support
- Add error handling

---

## 📨 KAFKA INTEGRATION

### Kafka Consumer Configurations

**KafkaConfig.java** defines 3 separate consumer factories:

#### 1. **Applicant Profile Consumer**

```java
@Bean
public ConsumerFactory<String, ApplicantCreatedEvent> applicantProfileConsumerFactory() {
    JsonDeserializer<ApplicantCreatedEvent> deserializer = 
            new JsonDeserializer<>(ApplicantCreatedEvent.class, false);
    deserializer.addTrustedPackages("com.job.manager.*");
    
    Map<String, Object> props = new HashMap<>();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-matching-group");
    
    return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
}
```

**Configuration:**
- **Topic:** `applicant.profile`
- **Consumer Group:** `notification-matching-group`
- **Deserializer:** JSON (`ApplicantCreatedEvent.class`)
- **Trusted Packages:** `com.job.manager.*`

#### 2. **Subscription Events Consumer**

```java
@Bean
public ConsumerFactory<String, SubscriptionEventDTO> subscriptionConsumerFactory() {
    // Same pattern as above
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-group");
    // ...
}
```

**Configuration:**
- **Topics:** `subscription.created`, `subscription.activated`, `subscription.expired`, `subscription.cancelled`, `subscription.expiring-soon`
- **Consumer Group:** `notification-group`
- **Deserializer:** JSON (`SubscriptionEventDTO.class`)

#### 3. **Applicant Matched Consumer** (Currently Unused)

```java
@Bean
public ConsumerFactory<String, ApplicantMatchedEvent> matchedConsumerFactory() {
    // Same pattern
}
```

**⚠️ Note:** This consumer factory is defined but NOT used anywhere. Possibly for future internal event handling.

### Kafka Bootstrap Server

**Environment Variable:** `KAFKA_BOOTSTRAP_SERVER`

**Default Values:**
- **Local:** `localhost:29092` (Docker Compose)
- **Production:** AWS MSK cluster endpoint (from ECS Task Definition)

---

## 📧 EMAIL SYSTEM

### SMTP Configuration

**Gmail SMTP Settings:**
- **Host:** `smtp.gmail.com`
- **Port:** `587` (STARTTLS)
- **Authentication:** Required
- **Security:** TLS (not SSL)

**Environment Variables:**
```bash
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password (spaces are auto-removed)
```

### Gmail App Password Setup

**⚠️ CRITICAL:** Gmail requires App Passwords (NOT regular password)

**Steps to Generate:**
1. Go to Google Account settings: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Navigate to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Copy the 16-character password (e.g., `audr bfnw hzns cyvm`)
6. **Important:** The code normalizer in `NotificationApplication.java` removes spaces automatically

### Email Template (Current)

**Format:** Plain text (no HTML)

```
From: {SMTP_EMAIL}
To: {company email from Authentication Service}
Subject: New matching applicant: {applicantName}
Body: An applicant matching your criteria has been found: {applicantName}
```

**⚠️ Limitations:**
- No HTML formatting
- No company name personalization
- No applicant details (skills, salary, etc.)
- No unsubscribe link
- No CTA button

**💡 Improvement Suggestions:**
- Use Thymeleaf templates
- Add rich applicant profile preview
- Add "View Profile" button linking to frontend
- Add unsubscribe link (GDPR compliance)

### Error Handling

**Current Behavior:**
```java
try {
    mailSender.send(mail);
    System.out.println("SENT EMAIL to " + email);
} catch (Exception ex) {
    System.out.println("FAILED to send email: " + ex.getMessage());
    ex.printStackTrace();
    // ⚠️ SILENT FAILURE - Does NOT throw exception
}
```

**⚠️ Issue:** Email failures are logged but NOT reported to caller. Notification is saved to MongoDB even if email fails.

**💡 Improvement Suggestions:**
- Implement Dead Letter Queue (DLQ) for failed emails
- Add retry mechanism with exponential backoff
- Store email status in `Notification` entity (`emailSent: true/false`)

---

## 💾 DATABASE SCHEMA

### MongoDB Configuration

**Database:** `mongodb-notification`  
**Port:** 27021 (local Docker), 27021 (production EC2)  
**Authentication:** `admin` / `admin`  
**Authentication Database:** `admin`

### Collection: `notifications`

**Entity:** `Notification.java`

```java
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;              // MongoDB auto-generated ObjectId
    
    private String companyId;       // Company who receives notification
    private String applicantId;     // Applicant who triggered notification
    private String applicantName;   // Applicant display name
    
    private String subject;         // Email subject
    private String message;         // Email body / notification content
    
    private boolean read;           // Read/unread status
    
    private Instant createdAt;      // Timestamp
}
```

**Indexes:**

Currently **NO indexes** defined in code. MongoDB auto-creates index on `_id` only.

**💡 Recommended Indexes:**

```javascript
// Company notifications (for API query)
db.notifications.createIndex({ companyId: 1, createdAt: -1 })

// Unread notifications count
db.notifications.createIndex({ companyId: 1, read: 1 })

// Cleanup old notifications
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days
```

### Sample Document

```json
{
  "_id": "67798b2e1234567890abcdef",
  "companyId": "comp123",
  "applicantId": "applicant456",
  "applicantName": "John Doe",
  "subject": "New matching applicant: John Doe",
  "message": "An applicant matching your criteria has been found: John Doe",
  "read": false,
  "createdAt": "2026-01-08T10:30:00.000Z"
}
```

---

## 🔌 API ENDPOINTS

### 1. **GET /notifications/{companyId}**

**Purpose:** Retrieve all notifications for a company (ordered by newest first)

**Request:**
```http
GET /notifications/comp123
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
[
  {
    "id": "67798b2e1234567890abcdef",
    "companyId": "comp123",
    "applicantId": "applicant456",
    "applicantName": "John Doe",
    "subject": "New matching applicant: John Doe",
    "message": "An applicant matching your criteria has been found: John Doe",
    "read": false,
    "createdAt": "2026-01-08T10:30:00.000Z"
  },
  {
    "id": "67798b2e1234567890abcde0",
    "companyId": "comp123",
    "applicantId": "applicant789",
    "applicantName": "Jane Smith",
    "subject": "New matching applicant: Jane Smith",
    "message": "An applicant matching your criteria has been found: Jane Smith",
    "read": true,
    "createdAt": "2026-01-07T15:20:00.000Z"
  }
]
```

**Controller Code:**

```java
@GetMapping("/{companyId}")
public ResponseEntity<List<Notification>> getNotifications(@PathVariable String companyId) {
    return ResponseEntity.ok(
        notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
    );
}
```

**⚠️ Issues:**
- No authentication/authorization (anyone can query any company's notifications if they know companyId)
- No pagination (returns ALL notifications)
- No filtering (read/unread, date range)

**💡 Improvements Needed:**
```java
// Add JWT authentication
@PreAuthorize("hasRole('COMPANY')")

// Add pagination
@GetMapping("/{companyId}")
public ResponseEntity<Page<Notification>> getNotifications(
    @PathVariable String companyId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) Boolean read
) {
    // Verify JWT token's userId matches companyId
    // Apply filters, pagination
}
```

### **Missing Endpoints** (Sprint 3 Tasks)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/notifications/{id}/read` | PATCH | Mark notification as read | ❌ Not implemented |
| `/notifications/unread-count` | GET | Get count of unread notifications | ❌ Not implemented |
| `/notifications/mark-all-read` | POST | Mark all notifications as read | ❌ Not implemented |

---

## ⚙️ CONFIGURATION

### application.yml

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVER:localhost:29092}
    consumer:
      group-id: notification-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.job.manager.*
        
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SMTP_EMAIL:}
    password: ${SMTP_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            
  data:
    mongodb:
      host: ${DATABASE_HOST:localhost}
      port: ${DATABASE_PORT:27021}
      database: mongodb-notification
      username: admin
      password: admin
      authentication-database: admin

services:
  authentication:
    base-url: ${AUTH_URL:http://localhost:8080/auth}
  subscription:
    base-url: ${SUBSCRIPTION_URL:http://localhost:8083}
```

### Environment Variables

#### **Required (Kafka)**
```bash
KAFKA_BOOTSTRAP_SERVER=localhost:29092  # or AWS MSK endpoint
```

#### **Required (Email)**
```bash
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password
```

#### **Required (Database)**
```bash
DATABASE_HOST=localhost
DATABASE_PORT=27021
```

#### **Required (Service URLs)**
```bash
AUTH_URL=http://localhost:8080/auth
SUBSCRIPTION_URL=http://localhost:8083
```

### Local Development (.env file)

Create `.env` file in `Backend/notification/` directory:

```bash
# Kafka
KAFKA_BOOTSTRAP_SERVER=localhost:29092

# Email
SMTP_EMAIL=hoquanghuyhhh@gmail.com
SMTP_PASSWORD=rjpg zllt teqc roow

# Database
DATABASE_HOST=localhost
DATABASE_PORT=27021

# Services
AUTH_URL=http://localhost:8080/auth
SUBSCRIPTION_URL=http://localhost:8083
```

### Production (AWS ECS Task Definition)

Environment variables are configured in ECS Task Definition (revision 20+):

```json
{
  "containerDefinitions": [
    {
      "name": "notification-service",
      "environment": [
        { "name": "KAFKA_BOOTSTRAP_SERVER", "value": "b-1.kafkacluster.xxx.kafka.ap-southeast-2.amazonaws.com:9092" },
        { "name": "SMTP_EMAIL", "value": "hoquanghuyhhh@gmail.com" },
        { "name": "SMTP_PASSWORD", "value": "rjpg zllt teqc roow" },
        { "name": "DATABASE_HOST", "value": "ec2-13-55-233-119.ap-southeast-2.compute.amazonaws.com" },
        { "name": "DATABASE_PORT", "value": "27021" },
        { "name": "AUTH_URL", "value": "http://authentication-service:8080/auth" },
        { "name": "SUBSCRIPTION_URL", "value": "http://subscription-service:8083" }
      ]
    }
  ]
}
```

---

## 🐛 KNOWN ISSUES & BUGS

### **CRITICAL ISSUES** 🔴

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| **No authentication on API endpoints** | Anyone can access any company's notifications | `NotificationController.java` |
| **SMTP password mismatch** | Production emails failing (already fixed in latest .env) | `.env`, ECS Task Definition |
| **Silent email failures** | No monitoring/alerting for failed emails | `NotificationService.java` |

### **HIGH PRIORITY** 🟠

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| **No pagination on API** | Frontend could crash with thousands of notifications | `NotificationController.java` |
| **No indexes on MongoDB** | Slow queries as data grows | MongoDB schema |
| **System.out.println instead of logger** | Production logs are unprofessional | Multiple files (101 SonarQube warnings) |
| **RestTemplate blocking calls** | Slow performance under load | `CompanyEmailClient.java`, `SubscriptionClient.java` |

### **MEDIUM PRIORITY** 🟡

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| **Subscription events not handled** | Companies don't get subscription lifecycle emails | `NotificationKafkaListener.java` |
| **No HTML email templates** | Unprofessional plain-text emails | `NotificationService.java` |
| **Cognitive Complexity 24** | Hard to maintain matching logic | `MatchingEngine.java` |
| **No health check endpoint** | Dockerfile health check fails | Missing `/actuator/health` |

### **LOW PRIORITY** 🟢

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| **Unused Kafka consumer factory** | Dead code | `KafkaConfig.java` (matchedConsumerFactory) |
| **Dependency vulnerabilities** | Security risks | `build.gradle` (spring-security-crypto, jjwt-impl) |

---

## 📦 DEPENDENCIES

### build.gradle

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.4'
    id 'io.spring.dependency-management' version '1.1.7'
}

dependencies {
    // Spring Boot Core
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // MongoDB
    implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
    
    // Redis (Currently unused in notification service)
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    
    // Email
    implementation 'org.springframework.boot:spring-boot-starter-mail'
    
    // Kafka
    implementation 'org.springframework.kafka:spring-kafka'
    
    // Validation
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Security (for bcrypt, not authentication)
    implementation 'org.springframework.security:spring-security-crypto'  // ⚠️ Vulnerability: HIGH
    
    // JWT (Currently unused in notification service)
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'  // ⚠️ Vulnerability: MEDIUM
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
    
    // Environment Variables
    implementation 'io.github.cdimascio:dotenv-java:3.0.0'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

### Dependency Management

**Spring Cloud BOM:** `2023.0.6`

```gradle
dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2023.0.6"
    }
}
```

### **Unused Dependencies** (Can be removed)

| Dependency | Reason |
|------------|--------|
| `spring-boot-starter-data-redis` | No Redis usage in notification service |
| `io.jsonwebtoken:jjwt-*` | JWT validation is done by Kong Gateway, not service |
| `spring-security-crypto` | No password hashing in notification service |

### **Security Vulnerabilities**

| Dependency | Severity | CVE |
|------------|----------|-----|
| `spring-security-crypto@6.3.3` | HIGH | OSV-GitHub |
| `jjwt-impl@0.11.5` | MEDIUM | OSV-GitHub |

**💡 Recommendation:** Remove unused dependencies to reduce attack surface

---

## 🚀 DEPLOYMENT

### Dockerfile (Multi-Stage Build)

```dockerfile
# Build stage
FROM gradle:8.5-jdk21-alpine AS builder
WORKDIR /app

# Copy Gradle files
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew ./

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src src

# Build application
RUN gradle clean bootJar --no-daemon -x test

# Production stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from builder
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM optimization
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", \
  "app.jar"]
```

**⚠️ Health Check Issue:** Dockerfile expects `/actuator/health` endpoint but Spring Boot Actuator is NOT included in dependencies.

**Fix:** Add to `build.gradle`:
```gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

### Docker Compose (Local)

```yaml
mongodb-notification:
  image: mongo:latest
  container_name: mongodb-notification
  ports:
    - "27021:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: admin
  volumes:
    - mongo_notification_data:/data/db
  networks:
    - job-manager-network
```

### AWS ECS Deployment

**Service:** `notification-service`  
**Task Definition:** `job-manager-notification` (revision 20+)  
**Port Mapping:** Dynamic → ALB (Target Group)  
**Health Check:** `/actuator/health` (⚠️ currently failing)

**Environment Variables:** See [Configuration](#configuration) section

---

## 🧪 TESTING

### Current Test Status: ❌ **NO TESTS**

**Test File:** `NotificationApplicationTests.java`

```java
@SpringBootTest
class NotificationApplicationTests {
    @Test
    void contextLoads() {
        // Empty test
    }
}
```

### **Missing Test Coverage**

| Component | Test Type | Priority |
|-----------|-----------|----------|
| `MatchingEngine.matches()` | Unit Test | CRITICAL |
| `NotificationService.handleApplicantMatched()` | Unit Test | CRITICAL |
| `ApplicantProfileKafkaListener` | Integration Test | HIGH |
| `CompanyEmailClient` | Unit Test (Mock RestTemplate) | HIGH |
| `NotificationController` | Integration Test | MEDIUM |

### **Recommended Test Cases**

#### **MatchingEngine.java**

```java
@Test
void shouldMatch_whenCountryAndTagsMatch() {
    // Given
    ApplicantCreatedEvent applicant = new ApplicantCreatedEvent();
    applicant.setCountry("Australia");
    applicant.setTechnicalTags(List.of("Java", "Spring Boot"));
    
    CompanySearchProfileDto profile = new CompanySearchProfileDto();
    profile.setCountry("Australia");
    profile.setTechnicalTags(List.of("Java", "Microservices"));
    
    // When
    boolean result = matchingEngine.matches(applicant, profile);
    
    // Then
    assertTrue(result);
}

@Test
void shouldNotMatch_whenCountryDifferent() {
    // Test country mismatch
}

@Test
void shouldNotMatch_whenNoTagOverlap() {
    // Test no common tags
}

@Test
void shouldMatch_whenSalaryRangeOverlaps() {
    // Test salary matching
}
```

#### **NotificationService.java**

```java
@Test
void shouldSaveNotificationAndSendEmail() {
    // Mock dependencies
    // Verify notification saved to MongoDB
    // Verify email sent via JavaMailSender
}

@Test
void shouldSkipEmail_whenSmtpNotConfigured() {
    // Test SMTP_EMAIL is blank
    // Verify notification saved but email NOT sent
}

@Test
void shouldHandleEmailFailure_gracefully() {
    // Mock JavaMailSender to throw exception
    // Verify notification still saved
}
```

### **Integration Testing**

#### **Kafka Integration Test**

```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"applicant.profile"})
class ApplicantProfileKafkaListenerIntegrationTest {
    
    @Autowired
    private KafkaTemplate<String, ApplicantCreatedEvent> kafkaTemplate;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Test
    void shouldProcessApplicantEvent() throws Exception {
        // Given
        ApplicantCreatedEvent event = new ApplicantCreatedEvent();
        event.setApplicantId("applicant123");
        event.setName("John Doe");
        event.setCountry("Australia");
        event.setTechnicalTags(List.of("Java", "Spring"));
        
        // When
        kafkaTemplate.send("applicant.profile", event);
        
        // Wait for async processing
        Thread.sleep(2000);
        
        // Then
        List<Notification> notifications = notificationRepository.findAll();
        assertThat(notifications).isNotEmpty();
    }
}
```

---

## 📋 SPRINT 3 TASKS

From `SPRINT3_ISSUES.md`:

### **Issue #6: Kafka Producer/Consumer - Job Update Notifications** ⏳ IN PROGRESS

**Label:** `backend` `kafka` `notification` `sprint-3`  
**Story Points:** 5

**Description:** Notify applicants when a job they applied for is updated.

**Flow:**
1. Company updates job (status/description/requirements)
2. Job Service publishes Kafka event: `job-updated`
3. Notification Service consumes event
4. Query applicants who applied to that job
5. Send email/in-app notification to each applicant

**Kafka Event Schema:**
```json
{
  "eventType": "job-updated",
  "jobId": "job123",
  "companyId": "comp456",
  "changes": ["status", "salary"],
  "timestamp": "2026-01-08T10:00:00Z"
}
```

**Acceptance Criteria:**
- [ ] Job Service publishes `job-updated` event
- [ ] Notification Service consumes and sends emails
- [ ] Email template created: "Job Update Notification"
- [ ] Applicants can opt-out of job update emails

**Implementation Checklist:**
- [ ] Create `JobUpdatedEvent.java` DTO
- [ ] Create `JobUpdateKafkaListener.java`
- [ ] Add Kafka consumer factory in `KafkaConfig.java`
- [ ] Create `notificationService.handleJobUpdate(event)` method
- [ ] Create HTML email template for job updates
- [ ] Add opt-out logic (check user preferences)

---

### **Issue #7: Subscription Lifecycle Email Notifications** ❌ NOT STARTED

**Label:** `backend` `notification` `sprint-3`  
**Story Points:** 3

**Description:** Implement email notifications for subscription events.

**Current Status:** Kafka listener exists but no business logic (see `NotificationKafkaListener.java` line 29)

**Events to Handle:**
- `subscription.created` → "Welcome! Your subscription is now active"
- `subscription.activated` → "Your subscription has been activated"
- `subscription.expiring-soon` → "Your subscription expires in 7 days"
- `subscription.expired` → "Your subscription has expired. Renew now!"
- `subscription.cancelled` → "Your subscription has been cancelled"

**Acceptance Criteria:**
- [ ] Implement `NotificationService.handleSubscriptionEvent(SubscriptionEventDTO)`
- [ ] Create 5 email templates (HTML + plain text fallback)
- [ ] Send emails to company owner (fetch email via CompanyEmailClient)
- [ ] Log all sent emails to CloudWatch

**Implementation Checklist:**
- [ ] Uncomment and implement listener in `NotificationKafkaListener.java`
- [ ] Create `EmailTemplateService.java` with Thymeleaf
- [ ] Create 5 HTML email templates in `resources/templates/email/`
- [ ] Update `NotificationService.java` with switch-case for event types
- [ ] Add email tracking (save to MongoDB with status)

---

### **Issue #10: Real-time In-App Notifications (WebSocket)** ❌ NOT STARTED

**Label:** `frontend` `backend` `websocket` `sprint-3`  
**Story Points:** 5

**Description:** Add real-time notification bell with WebSocket for instant updates.

**Current Status:** Only REST API exists (polling required)

**Technical Stack:**
- **Backend:** Spring WebSocket (STOMP over WebSocket)
- **Frontend:** Socket.io or native WebSocket API

**Acceptance Criteria:**
- [ ] Backend: `/ws/notifications` WebSocket endpoint
- [ ] Frontend: Bell icon with unread count
- [ ] Real-time push when new notification arrives
- [ ] Click notification → mark as read
- [ ] Notification dropdown showing latest 10 notifications

**Implementation Checklist:**
- [ ] Add `spring-boot-starter-websocket` dependency
- [ ] Create `WebSocketConfig.java` with STOMP config
- [ ] Create `NotificationWebSocketService.java`
- [ ] Modify `NotificationService.handleApplicantMatched()` to broadcast via WebSocket
- [ ] Frontend: Create `NotificationBell.jsx` component
- [ ] Frontend: Connect to WebSocket and listen for events

---

## 💡 DEVELOPER NOTES

### **Quick Start Guide**

#### 1. **Prerequisites**
```bash
# Java 21
java -version

# Docker & Docker Compose
docker --version
docker-compose --version

# Gradle (optional, uses wrapper)
./gradlew --version
```

#### 2. **Start Local Infrastructure**
```bash
cd Backend
docker-compose up -d mongodb-notification kafka
```

#### 3. **Configure Environment**
Create `Backend/notification/.env`:
```bash
KAFKA_BOOTSTRAP_SERVER=localhost:29092
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
DATABASE_HOST=localhost
DATABASE_PORT=27021
AUTH_URL=http://localhost:8080/auth
SUBSCRIPTION_URL=http://localhost:8083
```

#### 4. **Run Service**
```bash
cd Backend/notification
./gradlew bootRun
```

Service starts on port **8080** by default (configure via `SERVER_PORT` env var if needed).

#### 5. **Test Kafka Consumer**
Publish test event to Kafka:
```bash
kafka-console-producer --broker-list localhost:29092 --topic applicant.profile
```

Paste JSON:
```json
{
  "applicantId": "test123",
  "name": "Test Applicant",
  "country": "Australia",
  "technicalTags": ["Java", "Spring Boot"],
  "employmentStatus": ["EMPLOYED", "OPEN_TO_OFFERS"],
  "expectedSalaryMin": 80000,
  "expectedSalaryMax": 120000,
  "highestEducationDegree": "BACHELOR"
}
```

Check logs for: `Notification(Matching): received applicant event: ...`

---

### **Code Style & Conventions**

#### **Logging** (⚠️ MUST FIX)

**Current (BAD):**
```java
System.out.println("NotificationService: SENT EMAIL to " + email);
```

**Expected (GOOD):**
```java
@Slf4j
public class NotificationService {
    log.info("Sent email to {}", email);
}
```

Add Lombok's `@Slf4j` annotation to all classes.

#### **Error Handling**

**Current (BAD):**
```java
try {
    mailSender.send(mail);
} catch (Exception ex) {
    System.out.println("FAILED: " + ex.getMessage());
    // Silent failure
}
```

**Expected (GOOD):**
```java
try {
    mailSender.send(mail);
    log.info("Email sent successfully to {}", email);
} catch (MailException ex) {
    log.error("Failed to send email to {}: {}", email, ex.getMessage());
    throw new EmailDeliveryException("Email delivery failed", ex);
}
```

#### **REST Client**

**Current (BAD):**
```java
RestTemplate restTemplate = new RestTemplate();
UserDto user = restTemplate.getForObject(url, UserDto.class);
```

**Expected (GOOD):**
```java
@Bean
public WebClient.Builder webClientBuilder() {
    return WebClient.builder()
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .filter(ExchangeFilterFunctions.basicAuthentication(...));
}

// Usage
UserDto user = webClient.get()
    .uri(url)
    .retrieve()
    .bodyToMono(UserDto.class)
    .block();
```

---

### **Performance Optimization**

#### **Caching Search Profiles**

**Problem:** Every applicant event fetches ALL search profiles from Subscription Service.

**Solution:** Add Redis caching with 5-minute TTL.

```java
@Cacheable(value = "searchProfiles", key = "'all'")
public List<CompanySearchProfileDto> getAllSearchProfiles() {
    String url = subscriptionBaseUrl + "/subscriptions/search-profiles";
    CompanySearchProfileDto[] profiles = 
            restTemplate.getForObject(url, CompanySearchProfileDto[].class);
    return profiles != null ? Arrays.asList(profiles) : List.of();
}
```

Add dependency:
```gradle
implementation 'org.springframework.boot:spring-boot-starter-cache'
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

Add config:
```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5));
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

---

### **Monitoring & Observability**

#### **Add Actuator Endpoints**

```gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

Expose endpoints in `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

Access:
- Health: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Prometheus: `http://localhost:8080/actuator/prometheus`

#### **Add Custom Metrics**

```java
@Service
public class NotificationService {
    private final MeterRegistry meterRegistry;
    
    public void handleApplicantMatched(ApplicantMatchedEvent event) {
        meterRegistry.counter("notifications.sent", "type", "applicant_match").increment();
        
        try {
            mailSender.send(mail);
            meterRegistry.counter("email.sent", "status", "success").increment();
        } catch (Exception ex) {
            meterRegistry.counter("email.sent", "status", "failure").increment();
        }
    }
}
```

---

### **Security Checklist**

- [ ] Add JWT authentication to `/notifications/**` endpoints
- [ ] Verify user can only access their own notifications
- [ ] Add rate limiting to prevent spam
- [ ] Validate all input parameters (XSS protection)
- [ ] Add CORS configuration
- [ ] Remove sensitive data from logs (email passwords)
- [ ] Upgrade vulnerable dependencies

---

### **Troubleshooting**

#### **Email Not Sending**

**Symptoms:**
- Logs show "SMTP not configured (SMTP_EMAIL missing)"
- Or "Authentication failed"

**Checks:**
1. Verify `.env` file exists: `ls Backend/notification/.env`
2. Check SMTP credentials: `cat Backend/notification/.env | grep SMTP`
3. Check Gmail App Password is valid (revoked passwords fail silently)
4. Check logs on startup: `=== NotificationApplication SMTP DEBUG ===`
5. Test SMTP manually:
```bash
telnet smtp.gmail.com 587
EHLO localhost
STARTTLS
# Should respond with 220
```

#### **Kafka Events Not Consumed**

**Symptoms:**
- No logs showing "Notification(Matching): received applicant event"

**Checks:**
1. Verify Kafka is running: `docker ps | grep kafka`
2. Check Kafka topic exists:
```bash
kafka-topics --bootstrap-server localhost:29092 --list | grep applicant.profile
```
3. Check consumer group lag:
```bash
kafka-consumer-groups --bootstrap-server localhost:29092 \
  --group notification-matching-group --describe
```
4. Verify bootstrap server URL:
```bash
echo $KAFKA_BOOTSTRAP_SERVER
```

#### **MongoDB Connection Failed**

**Symptoms:**
- `MongoTimeoutException: Timed out after 30000 ms`

**Checks:**
1. Verify MongoDB is running: `docker ps | grep mongodb-notification`
2. Test connection:
```bash
mongosh mongodb://admin:admin@localhost:27021/mongodb-notification?authSource=admin
```
3. Check network: `docker network inspect job-manager-network`

---

### **Git Workflow**

#### **Branch Naming**
```
feature/notification-websocket
bugfix/notification-email-retry
hotfix/production-smtp-failure
```

#### **Commit Messages**
```
feat(notification): add WebSocket support for real-time updates
fix(notification): handle email failures gracefully with retry
refactor(notification): replace System.out with SLF4J logger
test(notification): add unit tests for MatchingEngine
```

---

## 📞 SUPPORT CONTACTS

**Current Developer (Handoff From):** Ho Quang Huy  
**Email:** hoquanghuyhhh@gmail.com  
**GitHub:** @hoquanghuy

**Next Developer (Handoff To):** [TBD]

**Service Owner:** Backend Team Lead  
**Sprint:** Sprint 3 (Week 6 deadline)

---

## 📚 REFERENCES

- [Sprint 3 GitHub Issues](/Users/hoquanghuy/Documents/GitHub/JobManager/SPRINT3_ISSUES.md)
- [JWT Token Flow Documentation](/Users/hoquanghuy/Documents/GitHub/JobManager/JWT_TOKEN_FLOW.md)
- [ERD Overview](/Users/hoquanghuy/Documents/GitHub/JobManager/Documents/Overview/ERD_Overview.md)
- [Backend-Frontend Integration Analysis](/Users/hoquanghuy/Documents/GitHub/JobManager/Documents/integration/BACKEND_FRONTEND_INTEGRATION_ANALYSIS.md)
- [Security Architecture](/Users/hoquanghuy/Documents/GitHub/JobManager/Documents/authorization_document/SECURITY_ARCHITECTURE.md)

---

## ✅ HANDOFF CHECKLIST

**Before delegating to another developer:**

- [ ] Developer has read this entire document
- [ ] Developer has access to AWS Console (ECS, MSK, EC2)
- [ ] Developer has configured Gmail App Password
- [ ] Developer can run service locally successfully
- [ ] Developer understands Kafka integration flow
- [ ] Developer understands matching algorithm logic
- [ ] Developer reviewed Sprint 3 tasks (Issues #6, #7, #10)
- [ ] Developer has asked questions and received answers
- [ ] Handoff meeting scheduled and completed

**Handoff Meeting Agenda:**
1. Architecture overview (15 min)
2. Live demo of applicant matching flow (10 min)
3. Code walkthrough (20 min)
4. Known issues discussion (10 min)
5. Sprint 3 tasks breakdown (10 min)
6. Q&A (15 min)

---

**Document Version:** 1.0  
**Last Updated:** January 9, 2026  
**Status:** Ready for handoff  

---

**END OF DOCUMENT**

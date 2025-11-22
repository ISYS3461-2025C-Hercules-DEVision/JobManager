# DM-07 – DTO & API Data Contract Mapping (Internal vs External DTOs – Job Manager)

**Scope:** Job Manager subsystem – all microservices shown in JM ERD v2  
(Company / Profile Management, Authentication & Authorization, Job Post, Applicant Search, Subscription, Payment, Notification).

**Goal:** Define DTOs for:

- Frontend ↔ Backend REST/HTTP APIs (**external DTOs**)
- Service ↔ Service communication (**internal DTOs / Kafka events**)
- Clarify which entity fields are **never exposed** or must be **obfuscated**

This is a *logical* mapping document; concrete OpenAPI/Proto files will be created later in CT-02.

---

## 0. Conventions

- **Naming**
  - External DTOs (public APIs): `XxxPublicDTO`, `XxxRequestDTO`, `XxxResponseDTO`.
  - Internal DTOs (service-to-service and events): `XxxInternalDTO`, `XxxEventPayload`.
  - Persistence entities keep simple names: `Company`, `JobPost`, `SearchProfile`, etc. (see DM-02).
- **Types**
  - `string` for IDs (`uuid`), dates (`ISO 8601`), enums, email.
  - `number` for numeric values, `boolean` for flags, `array<T>` for lists.
- **Security & privacy**
  - Never expose: `passwordHash`, `ssoId`, internal `failedAttempts`, raw `isRevoked`, internal `shardKey`, `lastPaymentTransactionId`, `rawGatewayRef`.
  - Token values (access/refresh) are only in Auth responses and must not be logged.
  - Payment DTOs never include card PAN/CVV; only gateway transaction metadata or redirect URLs.
- **Serialization**
  - JSON over HTTP for synchronous REST APIs.
  - JSON payload over Kafka for events (same DTO shape as HTTP where possible).

---

## 1. Company / Profile Management Service DTOs

### 1.1 Company (Core Company Account)

#### 1.1.1 External – CompanyAccountPublicDTO

Used by Job Manager frontend to display and edit basic company account information.

Example JSON:

    {
      "companyId": "uuid",
      "companyName": "string",
      "email": "string",
      "phoneNumber": "string|null",
      "country": "string",
      "city": "string|null",
      "streetAddress": "string|null",
      "isActive": true,
      "isPremium": false,
      "createdAt": "2025-11-21T09:00:00Z",
      "updatedAt": "2025-11-21T09:30:00Z"
    }

- Source entity: `Company` (DM-02).
- Hidden fields: `shardKey`, any internal audit fields beyond `createdAt` / `updatedAt`.

#### 1.1.2 Requests

CreateCompanyRequestDTO (registration – local account):

    {
      "companyName": "string",
      "email": "string",
      "password": "string",
      "country": "string",
      "city": "string|null",
      "streetAddress": "string|null",
      "phoneNumber": "string|null"
    }

UpdateCompanyAccountRequestDTO:

    {
      "companyName": "string",
      "phoneNumber": "string|null",
      "country": "string",
      "city": "string|null",
      "streetAddress": "string|null"
    }

> When `country` changes, backend handles shard migration; frontend only sends the new value.

---

### 1.2 Public Company Profile

Entity: `PublicProfile` (1-to-1 with `Company` by `companyId`).

#### 1.2.1 External – CompanyProfilePublicDTO

Used by:

- JM frontend (company side: preview profile),
- JA subsystem / frontend (applicant side: show company details on job and company pages).

Example JSON:

    {
      "companyId": "uuid",
      "displayName": "string",
      "aboutUs": "string|null",
      "whoWeAreLookingFor": "string|null",
      "websiteUrl": "string|null",
      "industryDomain": "string",
      "logoUrl": "string|null",
      "bannerUrl": "string|null",
      "country": "string",
      "city": "string|null"
    }

UpdateCompanyProfileRequestDTO:

    {
      "displayName": "string",
      "aboutUs": "string|null",
      "whoWeAreLookingFor": "string|null",
      "websiteUrl": "string|null",
      "industryDomain": "string",
      "country": "string",
      "city": "string|null",
      "logoUrl": "string|null",
      "bannerUrl": "string|null"
    }

---

### 1.3 Company Media

Entity: `CompanyMedia`.

#### 1.3.1 External – CompanyMediaDTO

Returned to frontend when listing or editing gallery items.

Example JSON:

    {
      "mediaId": "uuid",
      "url": "https://cdn.example.com/media/123.png",
      "mediaType": "image",
      "title": "string|null",
      "description": "string|null",
      "orderIndex": 1,
      "isActive": true,
      "uploadedAt": "2025-11-21T09:45:00Z"
    }

Create / update request (CompanyMediaRequestDTO – without url, which backend fills):

    {
      "mediaType": "image",
      "title": "string|null",
      "description": "string|null",
      "orderIndex": 1
    }

#### 1.3.2 Internal – CompanyMediaInternalDTO

Used only inside Profile Management service and file-storage integration.

    {
      "mediaId": "uuid",
      "companyId": "uuid",
      "url": "string",
      "mediaType": "image",
      "title": "string|null",
      "description": "string|null",
      "orderIndex": 1,
      "isActive": true,
      "storageBucket": "company-media",
      "storageKey": "company/{companyId}/{mediaId}.png",
      "uploadedAt": "2025-11-21T09:45:00Z"
    }

Fields `storageBucket` and `storageKey` are not exposed externally.

---

## 2. Authentication & Authorization DTOs

Job Manager has **two related services**:

- **Authentication Service** – manages login, registration, and mapping from credentials/SSO → `companyId`.
- **Authorization Service** – manages token metadata, introspection, and cross-service API access.

### 2.1 Login & Registration (Authentication Service – External)

CompanyLoginRequestDTO:

    {
      "email": "string",
      "password": "string"
    }

CompanyLoginResponseDTO:

    {
      "accessToken": "string",
      "refreshToken": "string",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "company": {
        "companyId": "uuid",
        "companyName": "string",
        "isPremium": false,
        "country": "string"
      }
    }

CompanyRefreshTokenRequestDTO:

    {
      "refreshToken": "string"
    }

SSOLoginRequestDTO:

    {
      "provider": "google",
      "idToken": "string"
    }

> These DTOs are used by the JM frontend. Tokens are opaque JWE/JWT strings.

---

### 2.2 Internal – AuthAccountInternalDTO (Authentication Service)

Entity: `AuthAccount` (authentication side, not exposed).

    {
      "authId": "uuid",
      "companyId": "uuid",
      "email": "string",
      "passwordHash": "string",
      "ssoProvider": "local",
      "ssoId": null,
      "isEmailVerified": true,
      "failedAttempts": 0,
      "createdAt": "2025-11-21T09:00:00Z",
      "updatedAt": "2025-11-21T09:30:00Z"
    }

- Never leaves Authentication service boundary.
- `passwordHash`, `ssoId`, `failedAttempts` are internal-only.

---

### 2.3 Authorization Service – Token DTOs

Entity: `AuthToken`.

AuthTokenInternalDTO (persistence shape):

    {
      "tokenId": "uuid",
      "companyId": "uuid",
      "issuedAt": "2025-11-21T09:00:00Z",
      "expiresAt": "2025-11-21T09:30:00Z",
      "isRevoked": false,
      "failedAttempts": 0
    }

TokenIntrospectionInternalDTO (used between API Gateway and Authorization):

    {
      "tokenId": "uuid",
      "companyId": "uuid",
      "isActive": true,
      "expiresAt": "2025-11-21T09:30:00Z",
      "scopes": [
        "jm:jobpost:write",
        "jm:profile:read"
      ]
    }

Neither `tokenId` nor `isRevoked` are exposed to browsers or external clients.

---

## 3. Job Post Service DTOs

Entities: `JobPost`, `JobPostSkill`, `SkillTag`.

### 3.1 Job Post – External DTOs

JobPostCreateRequestDTO:

    {
      "title": "Senior Backend Engineer",
      "description": "string",
      "employmentTypes": [
        "Full-time",
        "Fresher"
      ],
      "salaryType": "RANGE",
      "salaryMin": 1000,
      "salaryMax": 2000,
      "salaryCurrency": "USD",
      "city": "Ho Chi Minh",
      "country": "VN",
      "skillRequirements": [
        {
          "skillId": "uuid-skill-react",
          "importance": "MUST_HAVE"
        },
        {
          "skillId": "uuid-skill-kafka",
          "importance": "NICE_TO_HAVE"
        }
      ],
      "expiryDate": "2025-12-31T00:00:00Z"
    }

JobPostUpdateRequestDTO:

    {
      "title": "Senior Backend Engineer",
      "description": "string",
      "employmentTypes": [
        "Full-time"
      ],
      "salaryType": "RANGE",
      "salaryMin": 1200,
      "salaryMax": 2200,
      "salaryCurrency": "USD",
      "city": "Ho Chi Minh",
      "country": "VN",
      "skillRequirements": [
        {
          "skillId": "uuid-skill-react",
          "importance": "MUST_HAVE"
        }
      ],
      "expiryDate": "2026-01-15T00:00:00Z",
      "status": "PUBLISHED"
    }

JobPostPublicDTO (used by JM frontend and JA subsystem):

    {
      "jobPostId": "uuid",
      "companyId": "uuid",
      "title": "Senior Backend Engineer",
      "description": "string",
      "employmentTypes": [
        "Full-time",
        "Fresher"
      ],
      "salaryType": "RANGE",
      "salaryMin": 1000,
      "salaryMax": 2000,
      "salaryCurrency": "USD",
      "city": "Ho Chi Minh",
      "country": "VN",
      "isPublished": true,
      "status": "PUBLISHED",
      "skillRequirements": [
        {
          "skillId": "uuid-skill-react",
          "name": "React",
          "importance": "MUST_HAVE"
        },
        {
          "skillId": "uuid-skill-kafka",
          "name": "Kafka",
          "importance": "NICE_TO_HAVE"
        }
      ],
      "postedAt": "2025-11-21T10:00:00Z",
      "expiryDate": "2025-12-31T00:00:00Z",
      "createdAt": "2025-11-21T09:55:00Z",
      "updatedAt": "2025-11-21T10:05:00Z"
    }

---

### 3.2 Internal – JobPostInternalDTO

Used for persistence and as base for outgoing events.

    {
      "jobPostId": "uuid",
      "companyId": "uuid",
      "title": "Senior Backend Engineer",
      "description": "string",
      "employmentTypes": [
        "Full-time"
      ],
      "salaryType": "RANGE",
      "salaryMin": 1000,
      "salaryMax": 2000,
      "salaryCurrency": "USD",
      "city": "Ho Chi Minh",
      "country": "VN",
      "status": "PUBLISHED",
      "isPublished": true,
      "skillIds": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "createdAt": "2025-11-21T09:55:00Z",
      "updatedAt": "2025-11-21T10:05:00Z"
    }

---

### 3.3 Job Post Events – JobPostEventPayload (Kafka, JM → JA)

Emitted on topics such as `job-post-created`, `job-post-updated`.

    {
      "eventType": "job-post-created",
      "jobPostId": "uuid",
      "companyId": "uuid",
      "title": "Senior Backend Engineer",
      "country": "VN",
      "employmentTypes": [
        "Full-time"
      ],
      "salaryType": "RANGE",
      "salaryMin": 1000,
      "salaryMax": 2000,
      "skillIds": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "status": "PUBLISHED",
      "timestamp": "2025-11-21T10:05:00Z"
    }

JA subsystem uses this payload for job search index and applicant-side notifications.

---

## 4. Applicant Search Service DTOs

Entities: `SearchProfile`, `ApplicantFlag`.

### 4.1 SearchProfile (Company Headhunting Profile)

SearchProfilePublicDTO (external):

    {
      "searchProfileId": "uuid",
      "companyId": "uuid",
      "profileName": "Senior Backend VN",
      "desiredCountry": "VN",
      "desiredMinSalary": 1000,
      "desiredMaxSalary": 3000,
      "highestEducation": "Bachelor",
      "technicalBackground": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "employmentStatus": [
        "Full-time",
        "Fresher"
      ],
      "isActive": true,
      "createdAt": "2025-11-21T11:00:00Z",
      "updatedAt": "2025-11-21T11:05:00Z"
    }

SearchProfileCreateRequestDTO (and update, same shape):

    {
      "profileName": "Senior Backend VN",
      "desiredCountry": "VN",
      "desiredMinSalary": 1000,
      "desiredMaxSalary": 3000,
      "highestEducation": "Bachelor",
      "technicalBackground": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "employmentStatus": [
        "Full-time",
        "Fresher"
      ],
      "isActive": true
    }

> Backend validates that company has an ACTIVE Premium `Subscription` when `isActive = true`.

SearchProfileInternalDTO:

    {
      "searchProfileId": "uuid",
      "companyId": "uuid",
      "profileName": "Senior Backend VN",
      "desiredCountry": "VN",
      "desiredMinSalary": 1000,
      "desiredMaxSalary": 3000,
      "highestEducation": "Bachelor",
      "technicalBackground": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "normalizedSkillIds": [
        "uuid-skill-react",
        "uuid-skill-kafka"
      ],
      "employmentStatus": [
        "Full-time",
        "Fresher"
      ],
      "isActive": true,
      "createdAt": "2025-11-21T11:00:00Z",
      "updatedAt": "2025-11-21T11:05:00Z"
    }

---

### 4.2 ApplicantFlag (Favorite / Warning per Company)

ApplicantFlagPublicDTO:

    {
      "flagId": "uuid",
      "companyId": "uuid",
      "applicantId": "uuid",
      "status": "FAVORITE",
      "createdAt": "2025-11-21T12:00:00Z",
      "updatedAt": "2025-11-21T12:00:00Z"
    }

ApplicantFlagRequestDTO (create/update):

    {
      "applicantId": "uuid",
      "status": "FAVORITE"
    }

- `status` enum: `FAVORITE`, `WARNING`.
- `applicantId` is an external ID from JA subsystem (no FK).

---

### 4.3 ApplicantMatchEventPayload (Kafka, JA → JM → Notification)

Produced by Applicant Search after scoring:

    {
      "eventType": "applicant-matched",
      "companyId": "uuid",
      "searchProfileId": "uuid",
      "applicantId": "uuid",
      "matchScore": 0.87,
      "applicantSummary": {
        "fullName": "string",
        "country": "VN",
        "headline": "Backend Developer",
        "skillIds": [
          "uuid-skill-react",
          "uuid-skill-kafka"
        ]
      },
      "timestamp": "2025-11-21T12:15:00Z"
    }

Notification service consumes this to create real-time JobMatch notifications.

---

## 5. Subscription Service DTOs (Company Subscriptions)

Entity: `Subscription`.

### 5.1 SubscriptionStatusDTO (External)

Used by JM frontend (company dashboard).

    {
      "planType": "Premium",
      "isActive": true,
      "startDate": "2025-11-01T00:00:00Z",
      "expiryDate": "2025-12-01T00:00:00Z"
    }

### 5.2 SubscriptionInternalDTO

    {
      "subscriptionId": "uuid",
      "companyId": "uuid",
      "planType": "Premium",
      "startDate": "2025-11-01T00:00:00Z",
      "expiryDate": "2025-12-01T00:00:00Z",
      "status": "ACTIVE",
      "lastPaymentTransactionId": "uuid",
      "createdAt": "2025-11-01T00:00:00Z",
      "updatedAt": "2025-11-21T10:00:00Z"
    }

---

### 5.3 SubscriptionEventPayload (Kafka, Payment → Subscription → Others)

Example payload for `subscription-activated`:

    {
      "eventType": "subscription-activated",
      "companyId": "uuid",
      "subscriptionId": "uuid",
      "planType": "Premium",
      "status": "ACTIVE",
      "startDate": "2025-11-01T00:00:00Z",
      "expiryDate": "2025-12-01T00:00:00Z",
      "timestamp": "2025-11-01T00:00:00Z"
    }

Consumed by Notification service (for reminders) and Applicant Search (to gate `SearchProfile.isActive`).

---

## 6. Payment Service DTOs (Company Payments)

Entity: `PaymentTransaction`.

### 6.1 Initiate Payment – PaymentInitRequestDTO (External)

    {
      "planType": "Premium",
      "currency": "USD",
      "gateway": "Stripe"
    }

PaymentRedirectDTO (response):

    {
      "paymentUrl": "https://checkout.stripe.com/pay/cs_test_123",
      "transactionId": "uuid"
    }

> Client redirects browser to `paymentUrl`. Card details are handled by gateway; JM never sees PAN/CVV.

---

### 6.2 PaymentReceiptDTO (External)

Used after gateway callback / polling:

    {
      "transactionId": "uuid",
      "amount": 10.0,
      "currency": "USD",
      "gateway": "Stripe",
      "status": "Success",
      "timestamp": "2025-11-21T09:05:00Z"
    }

---

### 6.3 PaymentTransactionInternalDTO

Internal persistence and events:

    {
      "transactionId": "uuid",
      "companyId": "uuid",
      "subscriptionId": "uuid",
      "email": "billing@example.com",
      "amount": 10.0,
      "currency": "USD",
      "gateway": "Stripe",
      "timestamp": "2025-11-21T09:05:00Z",
      "status": "Success",
      "rawGatewayRef": "pi_123456789"
    }

Fields `email` and `rawGatewayRef` never appear in external DTOs.

---

## 7. Notification Service DTOs (Company-side Notifications)

Entity: `Notification`.

### 7.1 NotificationPublicDTO (External – Company UI)

    {
      "notificationId": "uuid",
      "type": "JobMatch",
      "message": "New applicant matched your 'Senior Backend VN' profile",
      "isRead": false,
      "timestamp": "2025-11-21T12:20:00Z"
    }

List is returned from:

- `GET /api/jm/notifications`
- optional filters like `?onlyUnread=true`.

---

### 7.2 NotificationInternalEventDTO

Used inside Notification service and as target payload for Kafka messages.

    {
      "notificationId": "uuid",
      "recipientId": "uuid",
      "channel": "inApp",
      "type": "JobMatch",
      "templateKey": "applicant_matched_profile",
      "templateParams": {
        "profileName": "Senior Backend VN",
        "applicantName": "Nguyen Van A"
      },
      "timestamp": "2025-11-21T12:20:00Z"
    }

`recipientId` corresponds to `companyId`. It is not directly exposed to clients (they are already authenticated as that company).

---

## 8. Sensitive Field Matrix (Job Manager)

| Service            | Entity             | Field                      | Rule for External DTOs                                                  |
|--------------------|--------------------|----------------------------|--------------------------------------------------------------------------|
| Authentication     | AuthAccount        | passwordHash               | Never exposed; internal only                                             |
| Authentication     | AuthAccount        | ssoId                      | Never exposed                                                            |
| Authentication     | AuthAccount        | failedAttempts             | Internal only                                                            |
| Authorization      | AuthToken          | tokenId                    | Internal only                                                            |
| Authorization      | AuthToken          | isRevoked, failedAttempts  | Internal only                                                            |
| Profile / Company  | Company            | shardKey                   | Internal only                                                            |
| Job Post           | JobPost            | internal audit fields      | Only `createdAt`, `updatedAt` exposed                                    |
| Subscription       | Subscription       | lastPaymentTransactionId   | Internal only                                                            |
| Payment            | PaymentTransaction | email                      | Not in public receipts; used only for reconciliation / invoicing        |
| Payment            | PaymentTransaction | rawGatewayRef              | Internal only                                                            |
| Notification       | Notification       | recipientId                | Not exposed; derived from authenticated company context on the backend  |

Errors must not leak sensitive information (e.g. use “Invalid credentials” instead of “user not found”).

---

## 9. Example End-to-End Flows & Payloads

### 9.1 Company Login (POST /api/jm/auth/login)

Request: `CompanyLoginRequestDTO`  
Response: `CompanyLoginResponseDTO`

Example response:

    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "string",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "company": {
        "companyId": "3d9e2c1a-9db2-4fed-9d0e-bf6e5d5c1b3e",
        "companyName": "DevVision Corp",
        "isPremium": false,
        "country": "VN"
      }
    }

---

### 9.2 Create Job Post (POST /api/jm/job-posts)

- Request: `JobPostCreateRequestDTO`
- Response: `JobPostPublicDTO`
- Side effect: JM publishes `JobPostEventPayload` to Kafka.

The JA subsystem consumes the event, updates its job index, and may notify premium applicants.

---

### 9.3 Applicant Match Notification Flow

1. JA subsystem publishes an `applicant-updated` event when an applicant edits their profile.  
2. JM Applicant Search service evaluates all active `SearchProfile` entities belonging to premium companies and emits `ApplicantMatchEventPayload` for each match.  
3. Notification service consumes this payload, creates a `Notification` entity, and later exposes it via `NotificationPublicDTO` in the JM frontend.

---

## 10. Definition of Done – DM-07 (Job Manager)

- `jm-dto-mapping.md` committed under `/docs/data-model/job-manager/`.
- For every JM entity from DM-01, at least one **external** and, where necessary, **internal** DTO is defined.
- Sensitive field matrix confirms that no external DTO contains `passwordHash`, raw token metadata, card data, `shardKey`, or internal gateway references.
- Example JSON payloads provided for:
  - Company login,
  - Job post creation,
  - Applicant match notification.
- DTO names and shapes are referenced in:
  - API contract draft (CT-02),
  - Event specifications (Kafka topics) shared with JA team.
- QA team has sample payloads for positive and negative tests (missing fields, invalid enums, wrong types).
- Any future changes to DM-01/DM-02/DM-03 require a synchronized update of this DM-07 file (linked from PR checklist).

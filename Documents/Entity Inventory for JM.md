# Entity Inventory – Job Manager Subsystem (DM-01)
> Source: EEET2582_DevVision-JobManager-v1.1.pdf  
> Scope: Sections 1 – 7  
> Milestone 1 Deliverable – Data Model (Level Simplex → Ultimo)

Each entity represents a persistent data object required by the Job Manager SRS.  
All attributes are preliminary for ER Model v1 (to be refined in DM-02).

---

## 1. Company
Stores the core identity, contact, and authentication data for each company user.  
📖 SRS §1 (Company Registration) & §2 (Company Login) & §3 (Profile Management) & §1.3 (Sharding & SSO)

| Attribute       | Type                                                | Description                                   | Notes |
|----------------|-----------------------------------------------------|-----------------------------------------------|-------|
| companyId      | string                                             | Unique company identifier                     | PK, UUID |
| companyName    | string                                             | Official company name                         | Shown on profile, job posts |
| email          | string                                             | Login & contact email                         | UNIQUE, case-insensitive |
| passwordHash   | string                                             | Hashed password for non-SSO accounts          | Null for SSO-only accounts |
| phoneNumber    | string                                             | Company contact phone                         | Optional; international format |
| streetAddress  | string                                             | Street and number                             | Optional |
| city           | string                                             | City                                          | Optional |
| country        | string                                             | Country of operation                          | Required; selected from dropdown |
| shardKey       | string                                             | Partition key used for sharding               | Same value as `country` (§1.3.3) |
| isEmailVerified| boolean                                            | Email activation status                       | Registration flow §1.1.3 |
| isActive       | boolean                                            | Account active/disabled                       | Used for admin locking, soft-delete |
| ssoProvider    | enum(`local`,`google`,`microsoft`,`facebook`,`github`) | Auth source                               | Ultimo SSO §1.3.1 |
| ssoId          | string                                             | External identity ID from SSO provider        | §1.3.2 |
| isPremium      | boolean                                            | Denormalized flag indicating active premium plan | Derived from CompanySubscription, displayed on profile §6.1.1 |
| createdAt      | datetime                                           | Creation timestamp                            |  |
| updatedAt      | datetime                                           | Last update timestamp                         |  |

---

## 2. CompanyAuthToken
Session and security token metadata for company accounts.  
📖 SRS §2 (Login Authentication, JWE, Brute-force Protection, Redis Revocation)

| Attribute     | Type    | Description                             | Notes |
|--------------|---------|-----------------------------------------|-------|
| tokenId      | string  | Unique token ID                         | PK |
| companyId    | FK → Company | Linked company account           |  |
| accessToken  | string  | Encrypted JWE token                     | §2.2.1 |
| refreshToken | string  | Long-lived refresh token                | §2.3.3 |
| issuedAt     | datetime| Time the token was issued               |  |
| expiresAt    | datetime| Token expiration time                   |  |
| isRevoked    | boolean| Revocation status                        | Used with Redis cache §2.2.3, §2.3.2 |
| failedAttempts | int   | Failed login attempts counter           | Supports brute-force blocking §2.2.2 |

---

## 3. CompanyPublicProfile
Public-facing profile that applicants can view.  
📖 SRS §3 (Profile Management)

| Attribute          | Type           | Description                              | Notes |
|--------------------|----------------|------------------------------------------|-------|
| companyId          | FK → Company   | One-to-one with Company                  | PK & FK |
| displayName        | string         | Public display name / brand name         | Often same as `companyName` |
| aboutUs            | text           | “About us” description                   | §3.1.x |
| whoWeAreLookingFor | text           | Description of target applicants         | §3.1.x |
| websiteUrl         | string         | Company homepage                         | Optional |
| industryDomain     | string         | Computer Science domain (e.g., FinTech, AI) | Required for sample dataset |
| logoUrl            | string         | Logo image URL                           | Medium level: logo upload |
| bannerUrl          | string         | Optional header/banner image URL         | Optional |
| country            | string         | Publicly displayed country               | Duplicated from Company for queries |
| city               | string         | Publicly displayed city                  | Optional |
| createdAt          | datetime       | Creation timestamp                       |  |
| updatedAt          | datetime       | Last update timestamp                    |  |

---

## 4. CompanyMedia
Gallery of images/videos shown on the company public profile.  
📖 SRS §3 (Profile Management – media gallery)

| Attribute   | Type         | Description                     | Notes |
|------------|--------------|---------------------------------|-------|
| mediaId    | string       | Unique media asset ID           | PK |
| companyId  | FK → Company | Owning company                  |  |
| url        | string       | Media file URL (image or video) | Store URL only; file in object storage |
| mediaType  | enum(`image`,`video`) | Type of media asset      |  |
| title      | string       | Short title or caption          | Optional |
| description| text         | Longer description              | Optional |
| orderIndex | int          | Display order within gallery    | Enables custom ordering |
| isActive   | boolean      | Whether shown on profile        | Soft-delete flag |
| uploadedAt | datetime     | Upload timestamp                |  |

---

## 5. JobPost
Represents a job posting created and managed by a company.  
📖 SRS §4 (Job Post Management)

| Attribute       | Type           | Description                                  | Notes |
|-----------------|----------------|----------------------------------------------|-------|
| jobPostId       | string         | Unique job post identifier                   | PK |
| companyId       | FK → Company   | Owning company                               |  |
| title           | string         | Job title                                    | §4.1.1 |
| description     | text           | Full job description                         | §4.1.1 |
| employmentTypes | `array<enum>`  | One or more of `Full-time`,`Part-time`,`Fresher`,`Internship`,`Contract` | §4.1.1; Full-time/Part-time mutually exclusive |
| postedAt        | datetime       | Posted date/time                             | §4.1.1 |
| expiryDate      | date           | Expiry date                                  | Optional; §4.1.1 |
| salaryType      | enum(`RANGE`,`ABOUT`,`UP_TO`,`FROM`,`NEGOTIABLE`) | Salary representation | §4.1.1 |
| salaryMin       | decimal(10,2)  | Minimum salary                               | Required for `RANGE`/`FROM`; default 0 if unset |
| salaryMax       | decimal(10,2)  | Maximum salary                               | Required for `RANGE`/`UP_TO`; null = no upper limit |
| salaryCurrency  | string         | Currency code (e.g., “USD”)                  |  |
| city            | string         | Location city                                | Mutually exclusive with “country-only” searches |
| country         | string         | Location country                             | Used in Applicants Search & Kafka updates §4.3.1 |
| isPublished     | boolean        | Whether job is visible to applicants         | Not public until `true` §4.1.1 |
| status          | enum(`DRAFT`,`PUBLISHED`,`ARCHIVED`) | Lifecycle state         | Separate active vs archived job posts |
| createdAt       | datetime       | Creation timestamp                           |  |
| updatedAt       | datetime       | Last update timestamp                        |  |

---

## 6. JobPostSkill
Normalized link between JobPost ↔ SkillTag (technical skills and competencies).  
📖 SRS §4.2.1 (Technical Skills per Job Post) & §4.3.1 (Kafka updates on skill changes)

| Attribute  | Type           | Description              | Notes |
|-----------|----------------|--------------------------|-------|
| jobPostId | FK → JobPost   | Job post                 | Part of composite PK |
| skillId   | FK → SkillTag  | Skill / competency       | Part of composite PK |
| importance| enum(`MUST_HAVE`,`NICE_TO_HAVE`) | Importance level | Optional; can refine matching logic |

> **Primary key:** (`jobPostId`, `skillId`).  
> Any change to this set of skills must trigger a Kafka event at Ultimo (§4.3.1).

---

## 7. SkillTag
Catalog of all technical skills and competencies used across the platform.  
📖 SRS §4.2.1 (Job Post Skills) & §5.2.2 & §6.2.2 (Technical Background tags)

> Logically shared between Job Applicant and Job Manager subsystems.  
> Physically may live in a dedicated catalog service or one of the subsystems.

| Attribute | Type   | Description                        |
|----------|--------|------------------------------------|
| skillId  | string | PK                                 |
| name     | string | Skill name (e.g., “React”, “Kafka”)|
| category | string | Optional skill category/domain     |
| isActive | boolean| Whether the tag is currently usable|

---

## 8. CompanySearchProfile
Saved “Applicant Searching Profile” used for premium real-time matching.  
📖 SRS §6.2.1 – §6.2.4 (Premium Company – Applicant Searching Profile)

| Attribute           | Type           | Description                                   |
|---------------------|----------------|-----------------------------------------------|
| searchProfileId     | string         | Unique search profile identifier              |
| companyId           | FK → Company   | Owning company                                |
| profileName         | string         | Human-readable label (e.g., “Senior Backend VN”) |
| desiredCountry      | string         | Target applicant country                      |
| desiredMinSalary    | decimal(10,2)  | Minimum desired salary                        |
| desiredMaxSalary    | decimal(10,2)  | Maximum desired salary                        |
| highestEducation    | enum(`Bachelor`,`Master`,`Doctorate`) | Highest education degree filter |
| technicalBackground | `array<string>`| List of desired skill tags                    |
| employmentStatus    | `array<enum>`  | `Full-time`,`Part-time`,`Fresher`,`Internship`,`Contract` |
| isActive            | boolean        | Whether this profile participates in matching |
| createdAt           | datetime       | Creation timestamp                            |
| updatedAt           | datetime       | Last update timestamp                         |

---

## 9. CompanySubscription
Tracks premium subscription plan and validity for each company.  
📖 SRS §6.1.1 – §6.1.2 (Premium Company Subscription – monthly payment, notifications)

| Attribute      | Type           | Description                               |
|----------------|----------------|-------------------------------------------|
| subscriptionId | string         | Unique subscription ID                    |
| companyId      | FK → Company   | Subscribed company                        |
| planType       | enum(`Free`,`Premium`) | Subscription type                  |
| priceAmount    | decimal(10,2)  | Subscription price                        |
| currency       | string         | Currency code                             |
| startDate      | datetime       | Subscription start                        |
| expiryDate     | datetime       | Subscription end                          |
| status         | enum(`ACTIVE`,`EXPIRED`,`CANCELLED`,`PENDING`) | Current status |
| lastPaymentId  | FK → PaymentTransaction | Last successful payment           |
| createdAt      | datetime       | Creation timestamp                        |
| updatedAt      | datetime       | Last update timestamp                     |

---

## 10. PaymentTransaction
Records each premium subscription payment handled by the Job Manager payment service.  
📖 SRS §6.1.1 (Monthly fee via third-party payment) & §7 (Payment Service Development)

| Attribute      | Type           | Description                                 |
|----------------|----------------|---------------------------------------------|
| transactionId  | string         | Unique payment transaction ID               |
| companyId      | FK → Company   | Paying company                              |
| subscriptionId | FK → CompanySubscription | Related subscription record     |
| email          | string         | Billing email used for payment              |
| amount         | decimal(10,2)  | Payment amount                              |
| currency       | string         | Currency code                               |
| gateway        | enum(`Stripe`,`PayPal`) | Third-party payment provider    |
| timestamp      | datetime       | Time of transaction                         |
| status         | enum(`Success`,`Failed`) | Outcome of payment transaction |
| rawGatewayRef  | string         | Gateway reference / transaction code        |

> This entity belongs to the Payment microservice implemented by the Job Manager team.  
> The Job Applicant subsystem consumes the Payment API but does not own this schema.

---

## 11. CompanyNotification
Represents notifications sent to companies (in-app and/or email), including real-time applicant matches.  
📖 SRS §6.3.1 (Kafka real-time notifications to premium companies) & §6.1.2 (Email reminders)

| Attribute      | Type           | Description                                   |
|----------------|----------------|-----------------------------------------------|
| notificationId | string         | Unique notification ID                        |
| companyId      | FK → Company   | Recipient company                             |
| type           | enum(`ApplicantMatch`,`SubscriptionReminder`,`System`) | Notification category |
| message        | text           | Human-readable message                        |
| channel        | enum(`inApp`,`email`) | Delivery channel                     |
| isRead         | boolean        | Read/acknowledged flag (for in-app)           |
| createdAt      | datetime       | Creation / send time                          |

---

## Traceability Summary

| SRS Section | Title                               | Key Job Manager Entities                                                   |
|------------|--------------------------------------|----------------------------------------------------------------------------|
| §1         | Company Registration                 | Company, CompanyAuthToken                                                  |
| §2         | Company Login & Security             | Company, CompanyAuthToken                                                  |
| §3         | Profile Management                   | Company, CompanyPublicProfile, CompanyMedia                                |
| §4         | Job Post Management                  | JobPost, JobPostSkill, SkillTag                                            |
| §5         | Applicants Search                    | *(No new entities; uses Applicant-side data & FTS)*                        |
| §6         | Premium Company Subscription & Real-time Notifications | CompanySubscription, CompanySearchProfile, PaymentTransaction, CompanyNotification |
| §7         | Payment Service Development          | PaymentTransaction, CompanySubscription                                    |

---

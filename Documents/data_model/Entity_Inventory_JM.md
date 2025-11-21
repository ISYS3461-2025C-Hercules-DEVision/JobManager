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
| companyId      | string                                              | Unique company identifier                     | PK, UUID |
| companyName    | string                                              | Official company name                         | Shown on profile, job posts |
| email          | string                                              | Login & contact email                         | UNIQUE, case-insensitive |
| passwordHash   | string                                              | Hashed password for non-SSO accounts          | Null for SSO-only accounts |
| phoneNumber    | string                                              | Company contact phone                         | Optional; international format |
| streetAddress  | string                                              | Street and number                             | Optional |
| city           | string                                              | City                                          | Optional |
| country        | string                                              | Country of operation                          | Required; selected from dropdown |
| shardKey       | string                                              | Partition key used for sharding               | Same value as `country` (§1.3.3) |
| isEmailVerified| boolean                                             | Email activation status                       | Registration flow §1.1.3 |
| isActive       | boolean                                             | Account active/disabled                       | Used for admin locking, soft-delete |
| ssoProvider    | enum(`local`,`google`,`microsoft`,`facebook`,`github`) | Auth source                                | Ultimo SSO §1.3.1 |
| ssoId          | string                                              | External identity ID from SSO provider        | §1.3.2 |
| isPremium      | boolean                                             | Denormalized flag indicating active premium plan | Derived from CompanySubscription, displayed on profile §6.1.1 |
| createdAt      | datetime                                            | Creation timestamp                            |  |
| updatedAt      | datetime                                            | Last update timestamp                         |  |

---

## 2. CompanyAuthToken
Session and security token metadata for company accounts.  
📖 SRS §2 (Login Authentication, JWE, Brute-force Protection, Redis Revocation)

| Attribute       | Type     | Description                             | Notes |
|----------------|----------|-----------------------------------------|-------|
| tokenId        | string   | Unique token ID                         | PK |
| companyId      | string   | Linked company account                  | Reference to Company.companyId |
| accessToken    | string   | Encrypted JWE token                     | §2.2.1 |
| refreshToken   | string   | Long-lived refresh token                | §2.3.3 |
| issuedAt       | datetime | Time the token was issued               |  |
| expiresAt      | datetime | Token expiration time                   |  |
| isRevoked      | boolean  | Revocation status                       | Used with Redis cache §2.2.3, §2.3.2 |
| failedAttempts | int      | Failed login attempts counter           | Supports brute-force blocking §2.2.2 |

---

## 3. CompanyPublicProfile
Public-facing profile that applicants can view.  
📖 SRS §3 (Profile Management)

| Attribute          | Type           | Description                              | Notes |
|--------------------|----------------|------------------------------------------|-------|
| companyId          | string         | One-to-one with Company                  | PK; references Company.companyId |
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

| Attribute   | Type   | Description                     | Notes |
|------------|--------|---------------------------------|-------|
| mediaId    | string | Unique media asset ID           | PK |
| companyId  | string | Owning company                  | References Company.companyId |
| url        | string | Media file URL (image or video) | Store URL only; file in object storage |
| mediaType  | enum(`image`,`video`) | Type of media asset      |  |
| title      | string | Short title or caption          | Optional |
| description| text   | Longer description              | Optional |
| orderIndex | int    | Display order within gallery    | Enables custom ordering |
| isActive   | boolean| Whether shown on profile        | Soft-delete flag |
| uploadedAt | datetime | Upload timestamp              |  |

---

## 5. JobPost
Represents a job posting created and managed by a company.  
📖 SRS §4 (Job Post Management)

| Attribute       | Type           | Description                                  | Notes |
|-----------------|----------------|----------------------------------------------|-------|
| jobPostId       | string         | Unique job post identifier                   | PK |
| companyId       | string         | Owning company                               | References Company.companyId |
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
| jobPostId | string         | Job post                 | Part of composite PK; references JobPost.jobPostId |
| skillId   | string         | Skill / competency       | Part of composite PK; **external ID** → SkillTag.skillId (Applicant side), no DB FK |
| importance| enum(`MUST_HAVE`,`NICE_TO_HAVE`) | Importance level | Optional; can refine matching logic |

> **Primary key:** (`jobPostId`, `skillId`).  
> Any change to this set of skills must trigger a Kafka event at Ultimo (§4.3.1).

---

## 7. SkillTag
Catalog of all technical skills and competencies used across the platform.  
📖 SRS §4.2.1 (Job Post Skills) & §5.2.2 & §6.2.2 (Technical Background tags)

> **Owned and persisted by the Job Applicant subsystem’s Profile/Skill Catalog service.**  
> Job Manager **does not** store this table in its own database; it only references `skillId` in JobPostSkill and search profiles.

| Attribute | Type   | Description                        | Notes |
|----------|--------|------------------------------------|-------|
| skillId  | string | PK                                 | Global skill identifier shared between JA and JM |
| name     | string | Skill name (e.g., “React”, “Kafka”)|  |
| category | string | Optional skill category/domain     |  |
| isActive | boolean| Whether the tag is currently usable| Managed on Applicant side |

---

## 8. CompanySearchProfile
Saved “Applicant Searching Profile” used for premium real-time matching.  
📖 SRS §6.2.1 – §6.2.4 (Premium Company – Applicant Searching Profile)

| Attribute           | Type           | Description                                   | Notes |
|---------------------|----------------|-----------------------------------------------|-------|
| searchProfileId     | string         | Unique search profile identifier              | PK |
| companyId           | string         | Owning company                                | References Company.companyId |
| profileName         | string         | Human-readable label (e.g., “Senior Backend VN”) |  |
| desiredCountry      | string         | Target applicant country                      |  |
| desiredMinSalary    | decimal(10,2)  | Minimum desired salary                        | Default 0 if unset |
| desiredMaxSalary    | decimal(10,2)  | Maximum desired salary                        | Null = no upper limit |
| highestEducation    | enum(`Bachelor`,`Master`,`Doctorate`) | Highest education degree filter |  |
| technicalBackground | `array<string>`| List of desired skill tags (`skillId` values) |  |
| employmentStatus    | `array<enum>`  | `Full-time`,`Part-time`,`Fresher`,`Internship`,`Contract` |  |
| isActive            | boolean        | Whether this profile participates in matching |  |
| createdAt           | datetime       | Creation timestamp                            |  |
| updatedAt           | datetime       | Last update timestamp                         |  |

---

## 9. ApplicantFlag
Per-company flags marking an applicant as **Warning** or **Favorite**.  
📖 SRS §5.3.2 (Mark Applicant as Warning/Favorite and show this state in results)

| Attribute   | Type           | Description                                   | Notes |
|-------------|----------------|-----------------------------------------------|-------|
| flagId      | string         | Unique flag identifier                        | PK |
| companyId   | string         | Company who set this flag                     | References Company.companyId |
| applicantId | string         | Target applicant                              | **External ID** from Job Applicant subsystem; string reference only, no FK |
| status      | enum(`WARNING`,`FAVORITE`) | Flag status                         |  |
| createdAt   | datetime       | When the flag was first created               |  |
| updatedAt   | datetime       | When the flag was last updated                |  |

---

## 10. CompanySubscription
Tracks premium subscription plan and validity for each company.  
📖 SRS §6.1.1 – §6.1.2 (Premium Company Subscription – monthly payment, notifications)

| Attribute      | Type           | Description                               | Notes |
|----------------|----------------|-------------------------------------------|-------|
| subscriptionId | string         | Unique subscription ID                    | PK |
| companyId      | string         | Subscribed company                        | References Company.companyId |
| planType       | enum(`Free`,`Premium`) | Subscription type                  |  |
| priceAmount    | decimal(10,2)  | Subscription price                        |  |
| currency       | string         | Currency code                             |  |
| startDate      | datetime       | Subscription start                        |  |
| expiryDate     | datetime       | Subscription end                          |  |
| status         | enum(`ACTIVE`,`EXPIRED`,`CANCELLED`,`PENDING`) | Current status |  |
| lastPaymentId  | string         | Last successful payment transaction ID    | **External reference** to PaymentTransaction.transactionId; no cross-DB FK |
| createdAt      | datetime       | Creation timestamp                        |  |
| updatedAt      | datetime       | Last update timestamp                     |  |

---

## 11. PaymentTransaction
Records each premium subscription payment handled by the shared Payment service.  
📖 SRS §6.1.1 (Monthly fee via third-party payment) & §7 (Payment Service Development)

| Attribute      | Type           | Description                                 | Notes |
|----------------|----------------|---------------------------------------------|-------|
| transactionId  | string         | Unique payment transaction ID               | PK |
| companyId      | string \| null | Paying company (Job Manager side)           | String reference to Company.companyId; may be null for Applicant payments |
| applicantId    | string \| null | Paying applicant (Job Applicant side)       | String reference to Applicant.applicantId; may be null for Company payments |
| subscriptionId | string \| null | Related subscription record (company side)  | String reference to CompanySubscription.subscriptionId; no FK |
| email          | string         | Billing email used for payment              |  |
| amount         | decimal(10,2)  | Payment amount                              |  |
| currency       | string         | Currency code                               |  |
| gateway        | enum(`Stripe`,`PayPal`) | Third-party payment provider    |  |
| timestamp      | datetime       | Time of transaction                         |  |
| status         | enum(`Success`,`Failed`) | Outcome of payment transaction |  |
| rawGatewayRef  | string         | Gateway reference / transaction code        |  |

> Business rule: For any given row, **either** `companyId` **or** `applicantId` is set (not both).  
> This entity belongs to the shared Payment microservice used by both Job Manager and Job Applicant subsystems; other services reference it by ID only (no cross-DB FKs).

---

## 12. Notification
Represents notifications sent to companies (and applicants) via the shared Notification service, including real-time applicant matches and subscription reminders.  
📖 SRS §6.3.1 (Kafka real-time notifications to premium companies) & §6.1.2 (Email reminders)

| Attribute      | Type           | Description                                   | Notes |
|----------------|----------------|-----------------------------------------------|-------|
| notificationId | string         | Unique notification ID                        | PK |
| recipientId    | string         | Recipient identifier                          | String reference only, no FK. On Job Manager side this is `companyId`; on Applicant side it is `applicantId`. |
| type           | enum(`ApplicationUpdate`,`JobMatch`,`SubscriptionReminder`,`System`) | Notification category | `JobMatch` is used for real-time applicant/job matches |
| message        | text           | Human-readable message                        |  |
| channel        | enum(`inApp`,`email`) | Delivery channel                     | Optional; JM-specific extension |
| isRead         | boolean        | Read/acknowledged flag (for in-app)           |  |
| timestamp      | datetime       | Creation / send time                          |  |

> This schema is shared between Job Manager and Job Applicant subsystems via the Notification microservice.

---

## Traceability Summary

| SRS Section | Title                               | Key Job Manager Entities                                                                              |
|------------|--------------------------------------|--------------------------------------------------------------------------------------------------------|
| §1         | Company Registration                 | Company, CompanyAuthToken                                                                              |
| §2         | Company Login & Security             | Company, CompanyAuthToken                                                                              |
| §3         | Profile Management                   | Company, CompanyPublicProfile, CompanyMedia                                                            |
| §4         | Job Post Management                  | JobPost, JobPostSkill, SkillTag (external catalog)                                                     |
| §5         | Applicants Search                    | CompanySearchProfile, ApplicantFlag, JobPost, JobPostSkill, SkillTag (external), Applicant data (JA)  |
| §6         | Premium Company Subscription & Real-time Notifications | CompanySubscription, CompanySearchProfile, PaymentTransaction, Notification                 |
| §7         | Payment Service Development          | PaymentTransaction, CompanySubscription                                                                |


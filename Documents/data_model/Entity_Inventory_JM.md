# 📌 DM-01 — Entities List (Aligned with Microservice Architecture & DEVision Ultimo Requirements)
> Source: EEET2582_DevVision-JobManager-v1.1.pdf  
> Scope: Sections 1 – 7  
> Milestone 1 Deliverable – Data Model (Level Simplex → Ultimo)

Each entity represents a persistent data object required by the **Job Manager subsystem**.  
All attributes are preliminary for ER Model v1 (to be refined in DM-02).

This document lists all entities required by the Job Manager subsystem.  
Each entity includes:

- Description  
- OwnedByService (microservice boundary)  
- DBType (Mongo/Postgres/Redis etc.)  
- Sharded? (Yes/No)  
- Source-of-Truth Information  
- Notes on cross-service references  

---

# 🟦 1. Company (Core Company Profile)

**OwnedByService:** Profile Management Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `country`  
**Source of Truth:** Yes  

**Description:**  
Stores the core organisational identity and contact information for each hiring company (name, contact details, country, active/premium status, etc.). This is the “business” representation of a company used across the Job Manager subsystem.

**Notes:**  
- `companyId` is the primary identifier for all Job Manager microservices and is used in integration with the Job Applicant subsystem (e.g. JobPost, Application, notifications).  
- Authentication credentials are handled in `AuthAccount` to avoid duplication.

---

# 🟧 2. AuthAccount (Authentication – Login Identity)

**OwnedByService:** Authentication Service  
**DBType:** Postgres  
**Sharded:** NO (global account store)  
**Source of Truth:** Yes  

**Description:**  
Represents the **login identity** of a company account, including login email, password hash (for local accounts), optional SSO provider/ID and basic security metadata such as creation/update times and failed login attempts.

**Notes:**  
- Links one-to-one with `Company` via `companyId`.  
- Used exclusively for **authentication** workflows (registration, login, password reset, SSO).  
- Other services interact with tokens from `AuthToken`, not raw credentials.

---

# 🟪 3. AuthToken (Authorization – API Access Token)

**OwnedByService:** Authorization Service  
**DBType:** Postgres (token metadata) + Redis (revocation cache)  
**Sharded:** NO  
**Source of Truth:** Authorization Service  

**Description:**  
Stores metadata for access and refresh tokens issued after successful authentication. Tokens are used to authorise API calls from web clients and between backend services.

**Notes:**  
- Each token record links back to the authenticated `AuthAccount` / `companyId`.  
- Redis is used as a fast deny-list to store revoked tokens and support logout + brute-force protection as specified in the SRS.  

---

# 🟦 4. PublicProfile (Company Public Profile)

**OwnedByService:** Profile Management Service  
**DBType:** Postgres (same DB/shard as Company)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Public-facing company profile visible to applicants: display name, about-us text, description of ideal candidates, website URL, industry domain, logo, banner and public location (country, city).

**Notes:**  
- One-to-one with `Company` via `companyId`.  
- Exposed via Job Manager APIs for the Job Applicant subsystem to show employer details on job listings and company profile pages.

---

# 🟦 5. CompanyMedia (Profile Media Gallery)

**OwnedByService:** Profile Management Service  
**DBType:** Postgres (same shard as Company)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Stores metadata for media assets (images/videos) attached to a company’s public profile, including URLs, media type, titles, descriptions, order index and active flag.

**Notes:**  
- Only the metadata and URLs are stored here; actual files are stored in object storage (e.g. S3/minio).  
- Used to display a gallery on the company profile page.

---

# 🟧 6. JobPost (Job Listing)

**OwnedByService:** Job Post Service  
**DBType:** Postgres  
**Sharded:** YES — co-located with Company by `companyId` / `country`  
**Source of Truth:** Yes  

**Description:**  
Represents a job posting created and managed by a company. Contains job title, full description, employment types, salary representation (RANGE/ABOUT/UP_TO/FROM/NEGOTIABLE), salary min/max, currency, location (city/country), publication status and lifecycle state (DRAFT/PUBLISHED/ARCHIVED).

**Notes:**  
- `jobPostId` is used externally by the Job Applicant subsystem (`Application.jobPostId`) and in Kafka events (`job-post-created`, `job-post-updated`).  
- Changes to job posts are propagated to Applicant-side search and premium notifications.

---

# 🟧 7. JobPostSkill (Relation: JobPost ↔ SkillTag)

**OwnedByService:** Job Post Service  
**DBType:** Postgres (same shard as JobPost)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Many-to-many mapping between `JobPost` and `SkillTag`, specifying which technical skills are required by the job and whether each skill is `MUST_HAVE` or `NICE_TO_HAVE`.

**Notes:**  
- Structurally mirrors `ApplicantSkill` on the Applicant side, but uses an `importance` field instead of `proficiency/endorsedBy`.  
- Primary uniqueness is per (`jobPostId`, `skillId`).  
- Any change in this mapping should trigger updates to search indices and matching logic.

---

# 🟦 8. SkillTag (Global Skill Catalog)

**OwnedByService:** Catalog / Profile Service  
**DBType:** Global catalog DB (Postgres or Mongo)  
**Sharded:** NO  
**Source of Truth:** Yes  

**Description:**  
Master catalog of skills and competencies (e.g. “React”, “Kafka”, “Docker”) used across the DEVision ecosystem. Shared logically between both subsystems.

**Notes:**  
- `skillId` is referenced by:
  - `ApplicantSkill` on the Job Applicant side.  
  - `JobPostSkill` on the Job Manager side.  
- A shared ID space allows the matching engine to compare applicant skills and job requirements directly.

---

# 🟨 9. SearchProfile (Company Headhunting Profile)

**OwnedByService:** Applicant Search Service / Subscription Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Yes  

**Description:**  
Saved “headhunting profiles” for companies that describe their desired candidate characteristics: target country, desired salary range, highest education level, technical background (skill tags) and employment status preferences.

**Notes:**  
- Evaluated against applicant profile events (via Kafka) to generate real-time matches for premium companies.  
- Only companies with an **ACTIVE Premium Subscription** are allowed to have `isActive = true` search profiles (business rule enforced at service level).  

---

# 🟨 10. ApplicantFlag (Favorite / Warning Flags)

**OwnedByService:** Applicant Search Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Yes  

**Description:**  
Per-company classification of applicants as `FAVORITE` or `WARNING`. Used to highlight candidates in search results and application detail views.

**Notes:**  
- `applicantId` is an external identifier from the Job Applicant subsystem (string reference, no FK).  
- There is at most one record per (`companyId`, `applicantId`).  

---

# 🟨 11. Subscription (Premium Company Subscription)

**OwnedByService:** Subscription Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Subscription Service  

**Description:**  
Records each company’s subscription to the premium plan, including plan type (Free/Premium), billing price and currency, start date, expiry date and current status.

**Notes:**  
- Only one subscription per company can be `ACTIVE` at a time.  
- Drives the `Company.isPremium` flag and enables premium features such as active `SearchProfile` and real-time notifications.  
- Links to the most recent successful payment via `lastPaymentId`.

---

# 🟨 12. PaymentTransaction (Company Subscription Payment)

**OwnedByService:** Payment Service  
**DBType:** Postgres (global)  
**Sharded:** NO  
**Source of Truth:** Payment Service  

**Description:**  
Records each payment attempt for company subscriptions, including the paying company, related subscription, amount, currency, payment gateway (e.g. Stripe/PayPal) and transaction status (Success/Failed).

**Notes:**  
- No sensitive card details are stored.  
- `companyId` and `subscriptionId` are used as references by other services; they need not be strict foreign keys across service boundaries.

---

# 🟪 13. Notification (Company Notifications)

**OwnedByService:** Notification Service  
**DBType:** MongoDB/Postgres  
**Sharded:** NO  
**Source of Truth:** Notification Service  

**Description:**  
Represents notifications sent to companies, including real-time applicant matches, subscription reminders and general system messages. Supports both in-app and email channels.

**Notes:**  
- `recipientId` stores the `companyId` of the target company (string reference).  
- The Notification Service consumes Kafka events (e.g. applicant-updated, application-submitted, subscription events) and writes notification records for the Job Manager frontend to display.

---

# 🧩 SUMMARY TABLE (Copy for report appendix)

| # | Entity             | OwnedByService           | DB Type               | Sharded? | Notes |
|---|--------------------|--------------------------|-----------------------|----------|-------|
| 1 | Company            | Profile Management       | Postgres              | YES      | ShardKey = country |
| 2 | AuthAccount        | Authentication           | Postgres              | NO       | Login identity & credentials |
| 3 | AuthToken          | Authorization            | Postgres + Redis      | NO       | API access tokens & revocation |
| 4 | PublicProfile      | Profile Management       | Postgres              | YES      | Public employer profile |
| 5 | CompanyMedia       | Profile Management       | Postgres              | YES      | Gallery metadata, files in object storage |
| 6 | JobPost            | Job Post                 | Postgres              | YES      | Job postings, referenced by Applicant subsystem |
| 7 | JobPostSkill       | Job Post                 | Postgres              | YES      | Job ↔ SkillTag mapping, importance flags |
| 8 | SkillTag           | Catalog / Profile        | Catalog DB            | NO       | Global skill catalog |
| 9 | SearchProfile      | Applicant Search         | Postgres              | YES      | Company headhunting profile (premium only) |
|10 | ApplicantFlag      | Applicant Search         | Postgres              | YES      | WARNING / FAVORITE per (company, applicant) |
|11 | Subscription       | Subscription             | Postgres              | YES      | Premium subscription info per company |
|12 | PaymentTransaction | Payment                  | Postgres              | NO       | Payment attempts, no card data |
|13 | Notification       | Notification             | MongoDB/Postgres      | NO       | Notifications to companies |

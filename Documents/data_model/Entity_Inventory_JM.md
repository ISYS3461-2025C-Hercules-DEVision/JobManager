# 📌 DM-01 — Entities List (Aligned with Microservice Architecture & DEVision Ultimo Requirements)
> Source: EEET2582_DevVision-JobManager-v1.1.pdf  
> Scope: Sections 1 – 7  
> Milestone 1 Deliverable – Data Model (Level Simplex → Ultimo)

Each entity represents a persistent data object required by the SRS.  
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

# 🟦 1. Company (Core Company Account)
**OwnedByService:** Profile Management Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `country`  
**Source of Truth:** Yes  

**Description:**  
Stores the core identity, contact, authentication and sharding information of the hiring company.

**Notes:**  
- `companyId` is the primary identifier for all Job Manager microservices and is used in external APIs (e.g. by the Job Applicant subsystem).

---

# 🟦 2. AuthToken
**OwnedByService:** Authentication Service  
**DBType:** Postgres (metadata) + Redis (revocation)  
**Sharded:** NO  
**Source of Truth:** Authentication Service  

**Description:**  
Stores token metadata for company login sessions, including encrypted access tokens, refresh tokens, issuance and expiry timestamps, revocation status and failed login counts.

**Notes:**  
- `companyId` links each token to a company account.  
- Redis is used to cache revoked tokens/denylist for fast lookup.

---

# 🟦 3. PublicProfile
**OwnedByService:** Profile Management Service  
**DBType:** Postgres (same DB/shard as Company)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Public-facing profile of the company, visible to applicants: brand name, description, what candidates they are looking for, website, industry domain and public location.

**Notes:**  
- One-to-one with `Company` via `companyId`.  
- Exposed via Job Manager APIs for consumption by the Job Applicant subsystem.

---

# 🟦 4. CompanyMedia
**OwnedByService:** Profile Management Service  
**DBType:** Postgres (same shard as Company)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Metadata for images and videos displayed in the company profile gallery (URL, media type, captions, order, active flag).

**Notes:**  
- Actual files are stored in Object Storage (e.g. S3/minio); this entity stores only metadata and URLs.

---

# 🟩 5. JobPost
**OwnedByService:** Job Post Service  
**DBType:** Postgres  
**Sharded:** YES — co-located with Company by `companyId` / `country`  
**Source of Truth:** Yes  

**Description:**  
Represents a job posting created and managed by a company, including job title, detailed description, employment types, salary configuration, location and status (draft/published/archived).

**Notes:**  
- `jobPostId` is used externally by the Applicant subsystem in `Application.jobPostId` and in Kafka events.  
- Job creation and updates trigger job-post events used for search and notification features.

---

# 🟩 6. JobPostSkill (Relation: JobPost ↔ SkillTag)
**OwnedByService:** Job Post Service  
**DBType:** Postgres (same shard as JobPost)  
**Sharded:** YES  
**Source of Truth:** Yes  

**Description:**  
Many-to-many mapping from JobPost to SkillTag, specifying which technical skills a job requires and whether each skill is must-have or nice-to-have.

**Notes:**  
- Primary key is (`jobPostId`, `skillId`).  
- `skillId` is an ID referencing `SkillTag` (skill catalog).  
- Any change to this mapping must be propagated via events so dependent services update their search indices.

---

# 🟦 7. SkillTag
**OwnedByService:** Job Post (Skill Catalog)  
**DBType:** Global catalog (Mongo/Postgres)  
**Sharded:** NO  
**Source of Truth:** Yes  

**Description:**  
Master list of skills/competencies (e.g. “React”, “Kafka”) reused across applicant profiles and job posts.

**Notes:**  
- `skillId` is referenced by both `ApplicantSkill` (on the Applicant side) and `JobPostSkill` (on the Job Manager side).  
- Managed by a dedicated skill/profile service; other services treat it as a read-only catalog.

---

# 🟨 8. SearchProfile
**OwnedByService:** Premium Subscription Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Yes  

**Description:**  
Saved “headhunting profile” for a company, capturing desired candidate filters such as country, salary range, highest education, technical background and employment status. Used to drive real-time applicant matching and notifications.

**Notes:**  
- Logical counterpart to `SearchProfile` on the Applicant side (applicant-defined job search preferences).  
- Evaluated whenever applicant profile events or updates arrive via Kafka.

---

# 🟨 9. ApplicantFlag
**OwnedByService:** Applicant Search Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Yes  

**Description:**  
Per-company flag indicating whether a given applicant is marked as **WARNING** or **FAVORITE**, used in applicant search results and application views.

**Notes:**  
- `applicantId` is a string reference to the Applicant subsystem (no foreign key).  
- Satisfies requirements to persist and surface Warning/Favorite states.

---

# 🟨 10. Subscription
**OwnedByService:** Subscription Service  
**DBType:** Postgres  
**Sharded:** YES — shardKey = `companyId`  
**Source of Truth:** Subscription Service  

**Description:**  
Tracks premium subscription plans and validity for each company, including plan type (Free/Premium), price, currency, start/end dates and status.

**Notes:**  
- Used to determine whether a company is premium and enable premium features (e.g. headhunting).  
- `lastPaymentId` links to the most recent payment transaction record.

---

# 🟨 11. PaymentTransaction
**OwnedByService:** Payment Service  
**DBType:** Postgres (global)  
**Sharded:** NO  
**Source of Truth:** Payment Service  

**Description:**  
Records each payment attempt for company premium subscriptions, including the payer company, subscription, amount, currency, payment gateway and outcome.

**Notes:**  
- `transactionId` is the primary identifier; no sensitive card data is stored.  
- `companyId` and `subscriptionId` are stored as string references only; other services reference payments via these IDs.

---

# 🟪 12. Notification
**OwnedByService:** Notification Service  
**DBType:** MongoDB/Postgres  
**Sharded:** NO  
**Source of Truth:** Notification Service  

**Description:**  
Represents email or in-app notifications sent to companies for events such as real-time applicant matches, subscription reminders and application updates.

**Notes:**  
- `recipientId` stores the `companyId` of the target company as a string reference.  
- Supports different notification `type` values (e.g. JobMatch, SubscriptionReminder, System) and delivery `channel` (in-app or email).

---

# 🧩 SUMMARY TABLE (Copy for report appendix)

| Entity              | OwnedByService         | DB Type           | Sharded? | Notes |
|---------------------|------------------------|-------------------|----------|-------|
| Company             | Company Service        | Postgres          | YES      | ShardKey = country |
| CompanyAuthToken    | Authentication Service | Postgres + Redis  | NO       | Token metadata + revocation |
| CompanyPublicProfile| Company/Profile        | Postgres          | YES      | Public employer profile |
| CompanyMedia        | Company/Profile        | Postgres          | YES      | Gallery metadata, files in object storage |
| JobPost             | Job Post Service       | Postgres          | YES      | Job postings, referenced by applications |
| JobPostSkill        | Job Post Service       | Postgres          | YES      | Job ↔ SkillTag mapping |
| SkillTag            | Profile Service        | Catalog DB        | NO       | Global skill catalog |
| CompanySearchProfile| Applicant Search       | Postgres          | YES      | Company headhunting profile |
| ApplicantFlag       | Applicant Search       | Postgres          | YES      | WARNING / FAVORITE per (company, applicant) |
| CompanySubscription | Subscription Service   | Postgres          | YES      | Premium subscription info |
| PaymentTransaction  | Payment Service        | Postgres          | NO       | Payment attempts, no card data |
| Notification        | Notification Service   | Mongo/Postgres    | NO       | Notifications to companies |


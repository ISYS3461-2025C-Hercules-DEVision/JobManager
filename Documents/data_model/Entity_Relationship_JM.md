# DM-03 — Relationships & Cardinalities (Job Manager Subsystem)

This document describes the **conceptual relationships** between entities in the Job Manager subsystem.

- It shows how entities connect inside the Job Manager databases.
- It also shows how Job Manager links to the **Job Applicant** subsystem using IDs/events (no hard FK across subsystems).

Cardinalities are expressed as:

- `1` — exactly one  
- `0..1` — zero or one  
- `0..N` — zero or many  
- `1..N` — one or many  

---

## 1. Company, Auth & Profile

### 1.1 Company → AuthToken

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can have **0..N** `AuthToken` (sessions).  
  - One `AuthToken` belongs to **exactly 1** `Company`.
- **Direction:** `Company.companyId` ↔ `AuthToken.companyId`.  
- **Usage:**
  - Login creates new `AuthToken` rows.
  - Logout / revoke sets `AuthToken.isRevoked = true` and adds entry in Redis.

---

### 1.2 Company → PublicProfile

- **Relationship type:** 1-to-1  
- **Cardinality:**
  - One `Company` has **0..1** `PublicProfile`.  
  - One `PublicProfile` belongs to **exactly 1** `Company`.
- **Direction:** `PublicProfile.companyId` = `Company.companyId` (also PK).  
- **Usage:**
  - Company onboarding may start without a public profile.
  - Applicant side uses this profile when showing job details and company pages.

---

### 1.3 Company → CompanyMedia

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can have **0..N** `CompanyMedia` items.  
  - One `CompanyMedia` item belongs to **exactly 1** `Company`.
- **Direction:** `CompanyMedia.companyId` → `Company.companyId`.  
- **Usage:**
  - Profile gallery (photos, office shots, etc.).
  - When a company is deleted/disabled, media records are soft-deleted or marked inactive and their files can be removed from object storage.

---

## 2. Job Posts & Skills

### 2.1 Company → JobPost

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can create **0..N** `JobPost`.  
  - One `JobPost` belongs to **exactly 1** `Company`.
- **Direction:** `JobPost.companyId` → `Company.companyId`.  
- **Usage:**
  - Job list on the company dashboard.
  - Applicant side references `JobPost.jobPostId` in `Application.jobPostId`.

---

### 2.2 JobPost → JobPostSkill → SkillTag

This mirrors the Applicant side relation `Applicant → ApplicantSkill → SkillTag`.

- **Core idea:**  
  - `JobPostSkill` links each `JobPost` to the global `SkillTag` catalog and records how important each skill is.

#### 2.2.1 JobPost → JobPostSkill

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `JobPost` can have **0..N** `JobPostSkill` rows.  
  - One `JobPostSkill` belongs to **exactly 1** `JobPost`.
- **Direction:** `JobPostSkill.jobPostId` → `JobPost.jobPostId`.  

#### 2.2.2 SkillTag → JobPostSkill

- **Relationship type:** 1-to-many (catalog to usage)  
- **Cardinality:**
  - One `SkillTag` can be used in **0..N** `JobPostSkill` rows.  
  - One `JobPostSkill` references **exactly 1** `SkillTag`.
- **Direction:** `JobPostSkill.skillId` → `SkillTag.skillId`.  

#### 2.2.3 Overall view

- **JobPost** ↔ **SkillTag** is **many-to-many** via `JobPostSkill`.  
- The structure is intentionally symmetric with `ApplicantSkill` on the Applicant side:

  - Applicant side: `Applicant` – `ApplicantSkill(id, applicantId, skillId, proficiency, ...)` – `SkillTag`.  
  - Manager side: `JobPost` – `JobPostSkill(id, jobPostId, skillId, importance, ...)` – `SkillTag`.

- **Business rules:**
  - Unique (`jobPostId`, `skillId`) pair in `JobPostSkill`.  
  - Changing the list of skills for a job must trigger a *job-post-updated* event so all search/matching logic stays correct.

---

### 2.3 JobPost → Application (Job Applicant subsystem)

- **Relationship type:** 1-to-many (conceptual, cross-subsystem)  
- **Cardinality:**
  - One `JobPost` can have **0..N** `Application` records (on Applicant side).  
  - One `Application` is submitted to **exactly 1** `JobPost`.
- **Direction:**
  - Applicant DB stores `Application.jobPostId` as a string ID coming from Job Manager.
- **Notes:**
  - No DB-level foreign key between subsystems; integrity is enforced at API and event level.
  - When a job is archived/expired, Applicant UI stops allowing new applications but keeps old applications for history.

---

## 3. Headhunting & Applicant Flags

### 3.1 Company → SearchProfile

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can define **0..N** `SearchProfile`.  
  - One `SearchProfile` belongs to **exactly 1** `Company`.
- **Direction:** `SearchProfile.companyId` → `Company.companyId`.  
- **Usage:**
  - Each SearchProfile encodes desired country, salary range, education and `technicalBackground` (array of `skillId`).
  - When Applicant subsystem emits `applicant-created` / `applicant-updated` events, the Applicant Search component runs matching logic against active `SearchProfile` rows.

---

### 3.2 Company ↔ Applicant (via ApplicantFlag)

- **Relationship type:** many-to-many via `ApplicantFlag`  
- **Cardinality:**
  - One `Company` can flag **0..N** different applicants.  
  - One applicant can be flagged by **0..N** different companies.
- **Direction:**
  - `ApplicantFlag.companyId` → `Company.companyId`.  
  - `ApplicantFlag.applicantId` is an ID referring to the Applicant subsystem.
- **Notes:**
  - At most one `ApplicantFlag` per (`companyId`, `applicantId`) pair.  
  - `status` is `WARNING` or `FAVORITE`, used when:
    - Showing applicant search results for a company.
    - Viewing a specific application for that company.

---

## 4. Subscription & Payments

### 4.1 Company → Subscription

- **Relationship type:** 1-to-many (historical)  
- **Cardinality:**
  - One `Company` can have **0..N** `Subscription` records over time.  
  - A `Subscription` belongs to **exactly 1** `Company`.
- **Direction:** `Subscription.companyId` → `Company.companyId`.  
- **Business rules:**
  - At most one subscription per company with `status = ACTIVE`.  
  - Subscription status drives `Company.isPremium`.

---

### 4.2 Subscription → PaymentTransaction

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Subscription` can be associated with **0..N** `PaymentTransaction`.  
  - One `PaymentTransaction` references **0..1** `Subscription` (it may be null in failure cases or one-off flows).
- **Direction:** `PaymentTransaction.subscriptionId` → `Subscription.subscriptionId` (string ID).  
- **Usage:**
  - Subscription renewal / initial purchase creates a `PaymentTransaction` row and updates `Subscription.lastPaymentId`.

---

### 4.3 Company → PaymentTransaction

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can have **0..N** `PaymentTransaction`.  
  - One `PaymentTransaction` is linked to **exactly 1** `Company`.
- **Direction:** `PaymentTransaction.companyId` → `Company.companyId`.  
- **Usage:**
  - Billing history screen for a company.
  - Audit trails and debugging payment issues.

---

## 5. Notifications

### 5.1 Company → Notification

- **Relationship type:** 1-to-many  
- **Cardinality:**
  - One `Company` can receive **0..N** `Notification`.  
  - One `Notification` belongs to **exactly 1** recipient (company in this subsystem).
- **Direction:** `Notification.recipientId` = `Company.companyId`.  
- **Usage:**
  - Types:
    - `JobMatch` – new/updated applicant matches a `SearchProfile`.  
    - `ApplicationUpdate` – new application or status change for one of the company’s jobs.  
    - `SubscriptionReminder` – upcoming expiry or billing issues.  
    - `System` – general system messages.
  - Channel:
    - `inApp` – shows in notification dropdown.  
    - `email` – sent via email provider.

---

## 6. Cross-Subsystem Events (Kafka)

Even though they are not “ERD relationships” in the strict sense, the SRS and architecture require some important **event-based links** between Job Manager and Job Applicant.

### 6.1 Events produced by Job Manager

- **JobPostCreated**
  - Producer: Job Post Service  
  - Payload (simplified): `jobPostId`, `companyId`, `title`, `employmentTypes`, `skills` (list of `skillId`), `salaryType/salaryMin/salaryMax`, `country`, `postedAt`.  
  - Consumers: Applicant search/indexing, Applicant notifications.

- **JobPostUpdated**
  - Producer: Job Post Service  
  - Triggered especially when `JobPostSkill` changes.  
  - Same consumers as above.

- **SubscriptionStatusChanged**
  - Producer: Subscription Service  
  - Payload: `companyId`, `subscriptionId`, `status`, `expiryDate`.  
  - Consumers: 
    - Profile / Company Service (update `Company.isPremium`).  
    - Notification Service (`SubscriptionReminder`, `System` messages).

---

### 6.2 Events consumed by Job Manager

- **ApplicantCreated / ApplicantUpdated**
  - Producer: Applicant Profile Service.  
  - Consumer: Applicant Search / Premium logic on Job Manager side.  
  - Effect: run matching against all active `SearchProfile` for premium companies and create `Notification` records of type `JobMatch`.

- **ApplicationSubmitted**
  - Producer: Application Service (Applicant subsystem).  
  - Consumers:
    - Job Manager UI / backend to show incoming applications for `JobPost`.  
    - Notification Service to send `ApplicationUpdate` notifications to the owning company.

---

## 7. Relationship Summary Table

| From Entity    | To Entity       | Type         | Cardinality (From → To)         | Notes |
|----------------|-----------------|-------------|----------------------------------|-------|
| Company        | AuthToken       | 1 → 0..N    | Login sessions per company       |
| Company        | PublicProfile   | 1 → 0..1    | Optional public profile          |
| Company        | CompanyMedia    | 1 → 0..N    | Profile gallery items            |
| Company        | JobPost         | 1 → 0..N    | Jobs owned by a company          |
| JobPost        | JobPostSkill    | 1 → 0..N    | Skills attached to a job         |
| SkillTag       | JobPostSkill    | 1 → 0..N    | Where a skill is required        |
| Company        | SearchProfile   | 1 → 0..N    | Saved headhunting profiles       |
| Company        | ApplicantFlag   | 1 → 0..N    | Flags set by a company           |
| Applicant (JA) | ApplicantFlag   | 1 → 0..N    | Conceptual (cross-subsystem)     |
| Company        | Subscription    | 1 → 0..N    | Historical subscription records  |
| Subscription   | PaymentTransaction | 1 → 0..N | Payments for a given subscription|
| Company        | PaymentTransaction | 1 → 0..N | All payments by a company        |
| Company        | Notification    | 1 → 0..N    | Notifications received by company|
| JobPost        | Application (JA)| 1 → 0..N    | Applications (Applicant side)    |

---

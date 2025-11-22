# 📌 DM-03 — Relationships & Integration (Job Manager Subsystem)
> Based on: DM-01 & DM-02 — Job Manager  
> Aligned with Job Applicant subsystem ERD and C4 container diagram.

This document describes **entity relationships**, **cardinalities**, and key **integration points** between Job Manager and Job Applicant subsystems.

Notation:

- `1 : 1` – one-to-one  
- `1 : N` – one-to-many  
- `N : M` – many-to-many (implemented via link table)  
- “soft reference” – no DB-level FK; ID is shared across services.

---

## 1. Internal Job Manager Relationships

### R1 — Company ↔ AuthAccount

- **Entities:** `Company` – `AuthAccount`  
- **Cardinality:** `1 : 1` (per company, exactly one login account)  
- **Ownership:**  
  - Profile Management Service owns `Company`.  
  - Authentication Service owns `AuthAccount`.  
- **Implementation:**  
  - `AuthAccount.companyId` (FK) points to `Company.companyId`.  
- **Notes:**  
  - Business rule: a `Company` must have one corresponding `AuthAccount` to log in.  
  - Email/password/SSO data is stored only in `AuthAccount`, not in `Company`.

---

### R2 — AuthAccount ↔ AuthToken

- **Entities:** `AuthAccount` – `AuthToken`  
- **Cardinality:** `1 : N` (one account, many tokens over time)  
- **Ownership:**  
  - Authentication Service: `AuthAccount`  
  - Authorization Service: `AuthToken`  
- **Implementation:**  
  - `AuthToken.authId` (FK) → `AuthAccount.authId`.  
- **Notes:**  
  - Tokens are issued after successful login and are stored in DB + Redis.  
  - Revocation or repeated failed attempts update `AuthToken.isRevoked` / `failedAttempts`.

---

### R3 — Company ↔ PublicProfile

- **Entities:** `Company` – `PublicProfile`  
- **Cardinality:** `1 : 1`  
- **Ownership:** Profile Management Service  
- **Implementation:**  
  - Same primary key: `PublicProfile.companyId` is both PK and FK to `Company.companyId`.  
- **Notes:**  
  - Guarantees exactly one public profile per company.  
  - PublicProfile is the DTO exposed to the Applicant subsystem.

---

### R4 — Company ↔ CompanyMedia

- **Entities:** `Company` – `CompanyMedia`  
- **Cardinality:** `1 : N`  
- **Ownership:** Profile Management Service  
- **Implementation:**  
  - `CompanyMedia.companyId` (FK) → `Company.companyId`.  
- **Notes:**  
  - Allows multiple images/videos per company profile.  
  - `isActive` used for soft delete / hiding items.

---

### R5 — Company ↔ JobPost

- **Entities:** `Company` – `JobPost`  
- **Cardinality:** `1 : N` (one company, many job posts)  
- **Ownership:** Job Post Service  
- **Implementation:**  
  - `JobPost.companyId` (FK) → `Company.companyId`.  
- **Notes:**  
  - Sharding is aligned: JobPost rows are partitioned using Company’s `country`/`shardKey`.  
  - Job Posts are the main data exposed to the Job Applicant subsystem.

---

### R6 — JobPost ↔ JobPostSkill ↔ SkillTag

- **Entities:** `JobPost`, `JobPostSkill`, `SkillTag`  
- **Cardinality:**  
  - `JobPost 1 : N JobPostSkill`  
  - `SkillTag 1 : N JobPostSkill`  
  - Overall: `JobPost N : M SkillTag` via `JobPostSkill`  
- **Ownership:**  
  - Job Post Service owns `JobPost` and `JobPostSkill`.  
  - Catalog/Profile Service owns `SkillTag`.  
- **Implementation:**  
  - `JobPostSkill.jobPostId` (FK) → `JobPost.jobPostId`.  
  - `JobPostSkill.skillId` (FK) → `SkillTag.skillId`.  
- **Notes:**  
  - Mirrors Applicant side `ApplicantSkill` structure.  
  - Business rule: `(jobPostId, skillId)` unique in `JobPostSkill`.  
  - Supports matching engine: compare `SkillTag.skillId` across applicants and job posts.

---

### R7 — Company ↔ SearchProfile

- **Entities:** `Company` – `SearchProfile`  
- **Cardinality:** `1 : N` (one company can define multiple headhunting profiles)  
- **Ownership:** Applicant Search / Subscription Service  
- **Implementation:**  
  - `SearchProfile.companyId` (FK) → `Company.companyId`.  
- **Notes:**  
  - Only premium companies (`Subscription.status = ACTIVE` and planType = `Premium`) may have `SearchProfile.isActive = true`.  
  - `technicalBackground` uses `SkillTag.skillId` list, aligning with Applicant skills.

---

### R8 — Company ↔ ApplicantFlag

- **Entities:** `Company` – `ApplicantFlag`  
- **Cardinality:** `1 : N` from Company side; `(companyId, applicantId)` unique  
- **Ownership:** Applicant Search Service  
- **Implementation:**  
  - `ApplicantFlag.companyId` (FK) → `Company.companyId`.  
  - `ApplicantFlag.applicantId` is an external ID from Applicant subsystem (soft reference).  
- **Notes:**  
  - Per-company flags allow UI to highlight WARNING/FAVORITE applicants in lists.  

---

### R9 — Company ↔ Subscription

- **Entities:** `Company` – `Subscription`  
- **Cardinality:** `1 : N` (history of subscriptions over time)  
- **Ownership:** Subscription Service  
- **Implementation:**  
  - `Subscription.companyId` (FK) → `Company.companyId`.  
- **Notes:**  
  - At most one `ACTIVE` subscription per company (business rule).  
  - `planType` and `status` drive `Company.isPremium` and premium feature access.

---

### R10 — Subscription ↔ PaymentTransaction

- **Entities:** `Subscription` – `PaymentTransaction`  
- **Cardinality:** `1 : N` (one subscription can have many payment attempts)  
- **Ownership:** Payment Service  
- **Implementation:**  
  - `PaymentTransaction.subscriptionId` is an optional string reference to `Subscription.subscriptionId`.  
  - `Subscription.lastPaymentId` points to most recent successful payment.  
- **Notes:**  
  - Relationship is *soft* across microservices (no cross-DB FK).  
  - Payment Service remains source of truth for payments; Subscription Service queries Payment API when necessary.

---

### R11 — Company ↔ PaymentTransaction

- **Entities:** `Company` – `PaymentTransaction`  
- **Cardinality:** `1 : N` (one company, many payments)  
- **Ownership:** Payment Service  
- **Implementation:**  
  - `PaymentTransaction.companyId` holds `Company.companyId` as a string reference.  
- **Notes:**  
  - Allows Payment Service to report payments per company.  
  - Again, no hard FK across service boundary.

---

### R12 — Company ↔ Notification

- **Entities:** `Company` – `Notification`  
- **Cardinality:** `1 : N` (one company, many notifications)  
- **Ownership:** Notification Service  
- **Implementation:**  
  - `Notification.recipientId` stores `Company.companyId` as a string reference.  
- **Notes:**  
  - Notifications are consumed by Job Manager frontend to render in-app notifications and send email.

---

## 2. Cross-Subsystem Relationships (Job Manager ↔ Job Applicant)

These are **logical** relationships implemented via REST APIs and Kafka events, not hard FKs.

### XR1 — JobPost (JM) ↔ Application (JA)

- **JM Entity:** `JobPost.jobPostId`, `companyId`, `title`, `description`, etc.  
- **JA Entity:** `Application` (Applicant subsystem).  
- **Link:**  
  - `Application.jobPostId` and `Application.companyId` store IDs obtained from Job Manager APIs.  
- **Usage:**  
  - Applicants view job posts and submit applications through JA.  
  - Companies in JM view applications for their job posts.

---

### XR2 — SkillTag (Shared Catalog)

- **JM Entities:** `JobPostSkill.skillId` → `SkillTag.skillId`.  
- **JA Entities:** `ApplicantSkill.skillId` → `SkillTag.skillId`.  
- **Link:**  
  - Both subsystems rely on the same `SkillTag` ID space (logical sharing).  
- **Usage:**  
  - Matching engine compares applicant skills vs job requirements using common IDs.  
  - Any change to SkillTag propagates to both sides (via catalog service / sync).

---

### XR3 — Company (JM) ↔ Company Profile DTO (JA)

- **JM Entity:** `PublicProfile` (+ selected fields from `Company`).  
- **JA Side:** Job Applicant front-end calls JM **Company API**.  
- **Link:**  
  - Company ID is sent in responses for JobPost and used to fetch PublicProfile.  
- **Usage:**  
  - Show employer details on JA job detail pages.

---

### XR4 — Applicant (JA) ↔ ApplicantFlag / SearchProfile (JM)

- **JM Entities:** `ApplicantFlag`, `SearchProfile`.  
- **JA Entities:** `Applicant`, `ApplicantSkill`, `Resume`, etc.  
- **Link:**  
  - `ApplicantFlag.applicantId` stores `Applicant.applicantId` (external ID).  
  - Search and matching use Applicant APIs and Kafka events (`applicant-created`, `applicant-updated`).  
- **Usage:**  
  - Applicant Search Service filters over JA data (skills, salary, location) and marks result rows with WARNING/FAVORITE flags.

---

## 3. Event-Driven Flows (Kafka Topics)

Although not ER relationships, events are crucial for consistency.

### E1 — JM → JA: Job Post Events

- **Topics:** `job-post-created`, `job-post-updated`  
- **Payload:** includes `jobPostId`, `companyId`, `title`, `skills`, `salary`, `country`, `status`, `timestamp`.  
- **Purpose:**  
  - JA updates its search indices and sends premium-applicant notifications.

---

### E2 — JA → JM: Applicant & Application Events

- **Topics:** `applicant-created`, `applicant-updated`, `application-submitted`  
- **Payloads:**  
  - `applicant-*` events include applicant profile + skills.  
  - `application-submitted` includes `applicationId`, `applicantId`, `jobPostId`, `submissionTime`.  
- **Purpose:**  
  - Applicant Search Service uses these events to evaluate `SearchProfile` filters and create `Notification` rows for matching companies.  
  - Companies see live updates for applications to their job posts.

---

### E3 — Subscription / Payment Events

- **Topics:** e.g. `subscription-activated`, `subscription-expired`, `payment-success`, `payment-failed`.  
- **Purpose:**  
  - Drive updates to `Company.isPremium` and deactivate `SearchProfile.isActive` when subscriptions expire.  
  - Trigger `Notification` entries for billing reminders.

---

## 4. Summary

- Internal relationships are normalised and aligned with microservice boundaries:  
  - Authentication (`AuthAccount`) vs Authorization (`AuthToken`) are separated but linked.  
  - Profile, Job Post, Subscription, Payment and Notification services own their own tables.
- Cross-subsystem linkages use **shared IDs** and **events**, not DB FKs, to keep Job Manager and Job Applicant loosely coupled but consistent.
- SkillTag and the JobPostSkill/ApplicantSkill pattern ensure that **matching logic** can operate on the same skill identifiers without duplication.

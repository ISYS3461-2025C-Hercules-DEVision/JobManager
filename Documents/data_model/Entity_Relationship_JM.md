# DEVision – Job Manager Subsystem  
## DM-03 — Model Relationships & Cardinalities

This document defines all entity-to-entity relationships for the **Job Manager** subsystem, based on:

- DM-01 (Job Manager `entities-list`)
- DM-02 (Job Manager `entities-datatypes`)
- Job Manager Functional Requirements (§1–7):contentReference[oaicite:0]{index=0}  
- Architecture & sharding requirements (Ultimo, Kafka, API gateway)  

It includes:

- Relationship type (1:1, 1:N, N:M)  
- Cardinality & optionality  
- Cascade rules  
- Join tables  
- Sharding + microservice considerations  
- Explicit distinction between relational vs. embedded structures  

---

# 1. Company-Centric Relationships

## 1.1 Company ↔ CompanyPublicProfile  

**Type:** 1 : 1  

**Cardinality:**  
- Company → exactly **1** CompanyPublicProfile  
- CompanyPublicProfile → exactly **1** Company  

**FK:** `CompanyPublicProfile.companyId`  

**Cascade:**  
- Delete Company → delete CompanyPublicProfile  

**Notes:**  
- Profile stores public-facing info (name, About Us, “Who we are looking for”, etc.) as required by Profile Management.  
- Private account data (email, password, phone, address) remains in `Company`.  

**SRS:** JM §1 (Registration), §3.1–3.2 (Profile Management)  

---

## 1.2 Company ↔ CompanyAuthToken  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** tokens  
- CompanyAuthToken → exactly **1** Company  

**FK:** `CompanyAuthToken.companyId`  

**Cascade:**  
- Delete Company → delete tokens  

**Notes:**  
- Stores metadata for JWS/JWE tokens, refresh token, revocation status, brute-force counters, etc., mirroring Applicant side AuthToken.  
- Redis stores revocation/blacklist state for JWE tokens.  

**SRS:** JM §2.1–2.3 (Login, token management)  

---

## 1.3 Company ↔ CompanyMedia  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** media items  
- CompanyMedia → exactly **1** Company  

**FK:** `CompanyMedia.companyId`  

**Cascade:**  
- Delete Company → delete CompanyMedia  

**Notes:**  
- Stores logo + gallery media (events, activities, etc.).  
- Only URLs/metadata are stored; binary files live in object storage.

**SRS:** JM §3.2.1–3.2.2 (Logo and gallery uploads)  

---

## 1.4 Company ↔ JobPost  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** JobPosts  
- JobPost → exactly **1** Company  

**FK:** `JobPost.companyId`  

**Cascade:**  
- **Soft delete Company**, **do not physically delete JobPosts**.  
- When a company is “removed” from UI, mark `Company.isActive = false` and archive its job posts instead of deleting rows.  

**Reasoning:**  
- Job Applicant subsystem stores applications referencing JobPosts and Companies via external IDs; those should remain valid for historical queries and analytics.  

**SRS:** JM §3 (Profile Management), §4 (Job Post Management), JA §4 (Applications reference JobPost/Company)  

---

## 1.5 Company ↔ CompanySearchProfile  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** search profiles  
- CompanySearchProfile → exactly **1** Company  

**FK:** `CompanySearchProfile.companyId`  

**Cascade:**  
- Delete Company → delete all CompanySearchProfiles  

**Notes:**  
- Each profile contains: desired technical background tags, employment status (multi-select), country, salary range, highest education, active flag, etc.  
- Used by Kafka-based real-time matching service for premium companies.  

**SRS:** JM §6.2.1–6.2.4, §6.3.1 (premium search & real-time notifications)  

---

## 1.6 Company ↔ CompanySubscription  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** subscriptions (history of renewals)  
- CompanySubscription → exactly **1** Company  

**FK:** `CompanySubscription.companyId`  

**Cascade:**  
- Delete Company → delete CompanySubscription rows  

**Notes:**  
- At business level, only **one active subscription** per company at a time.  
- Stores plan type, start/expiry dates, status, etc.  

**SRS:** JM §6.1.1–6.1.2 (Premium company subscription)  

---

## 1.7 Company ↔ PaymentTransaction  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** payment transactions  
- PaymentTransaction → exactly **1** Company  

**FK:** `PaymentTransaction.companyId`  

**Cascade:**  
- Delete Company → **keep or archive PaymentTransactions** (no hard delete recommended).  

**Reasoning:**  
- Payment records are part of financial/audit trail; in practice they should rarely be removed.  
- In the conceptual ERD we can allow cascade, but in implementation we’ll probably soft-delete the company and retain payments.  

**Notes:**  
- PaymentTransaction also links to CompanySubscription (see 4.1).  
- Same entity/table is reused by both Applicant and Company sides of the payment API.  

**SRS:** JM §6.1.2, §7 (Payment Service Development)  

---

## 1.8 Company ↔ CompanyNotification  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** notifications  
- CompanyNotification → exactly **1** Company  

**FK:** `CompanyNotification.companyId`  

**Cascade:**  
- Delete Company → delete CompanyNotifications  

**Notes:**  
- Stores in-system + Kafka-driven notifications (e.g., “new applicant matches your profile”, “subscription about to expire”).  
- Email notifications still use this record for audit / read tracking where needed (e.g., 7 days before expiry).  

**SRS:** JM §6.1.2 (expiry notifications), §6.3.1 (real-time notifications)  

---

## 1.9 Company ↔ ApplicantFlag  

*(This entity is the Job Manager mirror of “Warning / Favorite” requirement.)*  

**Type:** 1 : N  

**Cardinality:**  
- Company → **0..n** ApplicantFlags  
- ApplicantFlag → exactly **1** Company  

**FK:** `ApplicantFlag.companyId`  

**Cascade:**  
- Delete Company → delete ApplicantFlags  

**Notes:**  
- `ApplicantFlag` holds: `companyId`, external `applicantId` (from Applicant subsystem), and `status` enum (`Warning`,`Favorite`).  
- Status is shown in Applicant search results and on the applicant’s profile/application view.  

**SRS:** JM §5.3.2 (mark Applicant as Warning/Favorite)  

---

# 2. JobPost & Skill Relationships

## 2.1 JobPost ↔ JobPostSkill (junction / true N:M)  

**Type:** 1 : N from JobPost to JobPostSkill  
Represents **N:M** relationship between JobPost and SkillTag.  

**Cardinality:**  
- JobPost → **0..n** JobPostSkill rows  
- SkillTag → **0..n** JobPostSkill rows  

**FKs:**  
- `JobPostSkill.jobPostId` → JobPost  
- `JobPostSkill.skillId` → SkillTag  

**Cascade:**  
- Delete JobPost → delete JobPostSkill  
- Delete SkillTag → delete JobPostSkill (or soft-delete SkillTag)  

**Notes:**  
- These tags are used for full-text search & Applicant matching on JobPosts.  

**SRS:** JM §4.2.1 (skills/competencies tags on Job Posts)  

---

## 2.2 SkillTag ↔ JobPostSkill  

**Type:** 1 : N  

**Cardinality:**  
- SkillTag → **0..n** JobPostSkill rows  

**Cascade:**  
- Recommended: **soft-delete SkillTag** and keep JobPostSkill rows, so historical job posts still show their tags.  

**Notes:**  
- `SkillTag` is a shared catalog across subsystems. Applicant side also uses the same concept for resume & profile search.  

**SRS:** JM §4.2.1, JA §3.2.2 & §5.2.2 (shared skill tagging concept)  

---

## 2.3 JobPost ↔ Embedded Structures (Non-Relationships)

These structures are stored inside JobPost as arrays / JSON fields and **do not** form separate ER entities:

- **JobPost → EmploymentTypes (array)**  
  - E.g., `["Full-time","Part-time","Internship"]`.  
  - Stored as an array or normalized lookup, but conceptually treated as an embedded enumeration list.  

- **JobPost → SalaryRange (min/max)**  
  - Two scalar fields on JobPost; not a separate table.  

- **JobPost → Location (City, Country)**  
  - Scalars used for search and routing; no separate Location entity in conceptual model.  

**SRS:** JM §4.1.x (job post attributes), §5.1.x (search criteria: location, employment type, etc.)  

---

# 3. Cross-Subsystem References (Applicants & Applications)

These relationships are **conceptual** links to the **Job Applicant** subsystem; physically they are stored as external IDs (strings/UUIDs) with no DB-level foreign keys.

## 3.1 JobPost ↔ Application (external, Applicant subsystem)  

**Type:** N : 1 (from Application perspective)  

**Conceptual Cardinality:**  
- Application (in Applicant DB) → exactly **1** JobPost (in Manager DB)  
- JobPost → **0..n** Applications  

**Storage:**  
- Applicant subsystem keeps `Application.jobPostId` as an external ID referencing Job Manager’s `JobPost.jobPostId`.  

**Cascade:**  
- No cascade across databases.  
- If a JobPost is archived/soft-deleted, applications remain, but UI hides or marks them as “Job no longer visible”.  

**SRS:** JA §4 (Applications), JM §4.2.2 & §4.3.2 (display applications & CV/CL)  

---

## 3.2 Company ↔ Application (external, Applicant subsystem)  

**Type:** N : 1 (from Application perspective)  

**Conceptual Cardinality:**  
- Application → exactly **1** Company  
- Company → **0..n** Applications  

**Storage:**  
- Applicant DB stores `Application.companyId` as external ID corresponding to Job Manager `Company.companyId`.  

**Cascade:**  
- No cross-DB cascade.  
- When Company is soft-deleted, applications are still valid records in Applicant subsystem.  

**SRS:** JA §4 (Applications), JM §1–4 (Company & Job Posts)  

---

## 3.3 ApplicantFlag ↔ Applicant (external, Applicant subsystem)  

**Type:** N : 1 (from ApplicantFlag perspective)  

**Cardinality:**  
- ApplicantFlag → exactly **1** Applicant (external)  
- Applicant → **0..n** flags from different companies  

**Storage:**  
- Job Manager DB stores `ApplicantFlag.applicantId` as external ID from Applicant DB.  
- No physical FK constraint; consistency enforced via API.  

**Cascade:**  
- Applicant deletion/soft deletion is handled on Applicant side; Job Manager flags may be cleaned up via periodic jobs or Kafka signals if needed.  

**SRS:** JM §5.3.2 (Warning/Favorite) + JA §4–5 (Applicant identity and search)  

---

# 4. Subscription ↔ PaymentTransaction

## 4.1 CompanySubscription ↔ PaymentTransaction  

**Type:** 1 : N  

**Cardinality:**  
- CompanySubscription → **0..n** PaymentTransactions  
- PaymentTransaction → exactly **1** CompanySubscription  

**FK:** `PaymentTransaction.subscriptionId`  

**Cascade:**  
- Delete CompanySubscription → delete PaymentTransactions (conceptual)  

**Notes:**  
- PaymentTransaction also keeps `companyId` to simplify queries and align with shared Payment API used by both subsystems.  
- Supports multi-month renewals and repeated charges.  

**SRS:** JM §6.1–6.2 (Subscription), §7 (Payment Service Development)  

---

# 5. Embedded / Non-Relational Structures

These are modeled as JSON/array fields or scalar attributes and **do not** appear as entities in the ERD.

## 5.1 CompanySearchProfile → TechnicalBackground (array of tags)  

**Type:** Embedded tag list  

**Notes:**  
- Stored as an array of strings or tag IDs.  
- Used for matching against Applicants’ skills tags via Kafka.  

**SRS:** JM §6.2.1–6.2.2  

---

## 5.2 CompanySearchProfile → EmploymentStatus (array of enums)  

**Type:** Embedded multi-select  

**Notes:**  
- Values subset: `Full-time`, `Part-time`, `Fresher`, `Internship`, `Contract`.  
- Stored as array; not a separate table.  

**SRS:** JM §6.2.3  

---

## 5.3 CompanySearchProfile → SalaryRange (min/max)  

**Type:** Scalar pair (min, max)  

**Notes:**  
- Both are columns on CompanySearchProfile; not a separate SalaryRange entity.  

**SRS:** JM §6.2.4  

---

## 5.4 CompanyPublicProfile → “Who we are looking for”  

**Type:** Single text field  

**Notes:**  
- Describes desired personality & values, not used for structured matching; stays as plain text.  

**SRS:** JM §3.1.2  

---

# 6. Sharding & Microservice Considerations

- **Shard Key (Job Manager):** `Company.country` (and/or derived `Company.shardKey`).  
  - All Company-owned entities (CompanyAuthToken, CompanyPublicProfile, CompanyMedia, JobPost, CompanySearchProfile, CompanySubscription, CompanyNotification, ApplicantFlag) must live in the **same shard** as their Company.  
- **Cross-Subsystem Relations:**  
  - Application → JobPost / Company, ApplicantFlag → Applicant are **references only** (string/UUID IDs), **no physical FK** across databases.  
- **Microservice Ownership:**  
  - Company Service owns Company & CompanyPublicProfile & AuthToken.  
  - JobPost Service owns JobPost & JobPostSkill.  
  - Subscription/Payment Service owns CompanySubscription & PaymentTransaction.  
  - Notification Service consumes Kafka events and writes CompanyNotification (and potentially publishes them via WebSocket/email).  
- **Kafka Integration:**  
  - JobPost and CompanySearchProfile changes publish to Kafka to notify Applicant side or trigger Applicant matching.  
  - Applicant profile updates (from Applicant subsystem) are consumed here to generate CompanyNotification for premium companies.  

---

# 7. Relationship Summary Table

| Relationship                          | Type    | Cardinality         | Optionality (child)             | Cascade / Policy                     |
|--------------------------------------|---------|---------------------|---------------------------------|--------------------------------------|
| Company — CompanyPublicProfile       | 1 : 1   | 1 ↔ 1               | Profile not optional in design  | Delete Company → delete Profile      |
| Company — CompanyAuthToken          | 1 : N   | 1 ↔ 0..n            | Tokens optional                 | Delete Company → delete Tokens       |
| Company — CompanyMedia               | 1 : N   | 1 ↔ 0..n            | Media optional                  | Delete Company → delete Media        |
| Company — JobPost                    | 1 : N   | 1 ↔ 0..n            | JobPosts optional               | **Soft-delete Company**, archive JobPosts |
| Company — CompanySearchProfile       | 1 : N   | 1 ↔ 0..n            | Search profiles optional        | Delete Company → delete Profiles     |
| Company — CompanySubscription        | 1 : N   | 1 ↔ 0..n            | Subscriptions optional          | Delete Company → delete Subscriptions|
| Company — PaymentTransaction         | 1 : N   | 1 ↔ 0..n            | Payments optional               | Prefer keep for audit (no hard delete) |
| Company — CompanyNotification        | 1 : N   | 1 ↔ 0..n            | Notifications optional          | Delete Company → delete Notifications|
| Company — ApplicantFlag              | 1 : N   | 1 ↔ 0..n            | Flags optional                  | Delete Company → delete Flags        |
| JobPost — JobPostSkill               | 1 : N   | 1 ↔ 0..n            | Tags optional                   | Delete JobPost → delete JobPostSkill |
| SkillTag — JobPostSkill              | 1 : N   | 1 ↔ 0..n            | Links optional                  | Soft-delete SkillTag, clean links    |
| JobPost — Application (external)     | N : 1   | n ↔ 1               | Application must have JobPost   | No cross-DB cascade                  |
| Company — Application (external)     | N : 1   | n ↔ 1               | Application must have Company   | No cross-DB cascade                  |
| CompanySubscription — PaymentTransaction | 1 : N | 1 ↔ 0..n          | Payment optional per subscription | Delete Subscription → delete Payments (conceptually) |
| Company — Shard (logical)            | 1 : 1   | 1 ↔ 1               | –                               | Child entities co-located in shard   |

---


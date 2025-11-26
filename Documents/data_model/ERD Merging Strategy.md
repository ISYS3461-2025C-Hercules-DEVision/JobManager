# DEVision – Combined ERD Design Guide (Job Applicant + Job Manager)

> Goal: Document how to **combine the Job Applicant (JA) and Job Manager (JM) ERDs** into a single “whole system” ERD, while still respecting microservice boundaries and clearly showing **min–max cardinalities** and **cross-system relationships**.

This file explains:

- How to lay out entities from both subsystems on one canvas.
- Which **cross-system links** to draw and their **min/max**.
- How to present **shared services** (SkillTag, Payment, Notification, Auth).
- What annotations/legend to add so the examiner understands the architecture.

---

## 1. High-Level Idea

- We **do not merge databases**.
- We simply place **both ERDs on one large diagram** and then:
  - Connect them using **dashed lines** for cross-service references (REST / Kafka).
  - Show **cardinality (min..max)** at both ends of each relationship.
  - Add short notes like “external ID reference (no FK)” near the line.

This produces a single ERD that shows the **whole DEVision ecosystem**.

---

## 2. Layout on a Single Canvas

On draw.io, create a new diagram and:

1. Place the **Job Applicant subsystem** on the **left**:

   - Applicant Service:  
     - Applicant  
     - Education  
     - WorkExperience  
     - Resume  
     - MediaPortfolio  
     - ApplicantSkill  
     - SkillTag (if still drawn here)

   - Application Service:  
     - Application  
     - CVFileReference  
     - CoverLetterReference  

   - JA Subscription Service:  
     - Subscription  

   - JA Payment Service:  
     - PaymentTransaction  

   - JA Notification Service:  
     - Notification  

   - JA Auth / Authorization Services:  
     - AuthAccount  
     - AuthToken  

   - Admin Service:  
     - SystemAdmin  

2. Place the **Job Manager subsystem** on the **right**:

   - Profile Management Service:  
     - Company  
     - PublicProfile  
     - CompanyMedia  

   - Job Post Service:  
     - JobPost  
     - JobPostSkill  
     - SkillTag (if drawn only on JM side or in centre)

   - Applicant Search Service:  
     - ApplicantFlag  
     - SearchProfile (or CompanySearchProfile)

   - JM Subscription Service:  
     - Subscription (CompanySubscription)

   - JM Payment Service:  
     - PaymentTransaction  

   - JM Notification Service:  
     - Notification  

   - JM Auth / Authorization Services:  
     - AuthAccount  
     - AuthToken  

3. Optionally add a **middle block** labelled **“Shared / Integration Services”** and move the “truly shared” entities there:

   - SkillTag (global skill catalog)
   - PaymentTransaction (shared payment service)
   - Notification (shared notification service)
   - Auth/Token if you model a unified auth service

---

## 3. Notation & Legend

Add a small legend box on the diagram:

- **Solid line with crow’s foot + PK/FK text**  
  = Relationship within a microservice / same DB, **real FK**, normal ERD behaviour.

- **Dashed line**  
  = Cross-microservice relationship via **REST or Kafka** using **external IDs only** (no DB-level FK). Used for JA ↔ JM integration.

- **Min–max notation** (on each end of a relationship):  
  - `0..1` – optional, at most one  
  - `1..1` – exactly one  
  - `0..*` – zero or many  
  - `1..*` – one or many

- **Text notes** near dashed lines:  
  - e.g. “external reference (no FK, via API)”  
  - e.g. “payload in Kafka event job-post-created / application-submitted”

---

## 4. Cross-System Relationships (With Min–Max)

These are the lines that connect JA entities to JM entities.

### 4.1 JobPost ↔ Application

**Purpose:** Each application is submitted for a specific job post.

- Fields:
  - `Application.jobPostId : String (uuid)` → `JobPost.jobPostId`

- Cardinality:
  - JobPost → Application: `0..*`  
    (A job may receive zero or many applications.)
  - Application → JobPost: `1..1`  
    (Every application must belong to exactly one job.)

- Diagram:
  - Dashed line from **Application** (JA) to **JobPost** (JM).
  - Label on the line: “jobPostId external reference (no FK)”.

---

### 4.2 Company ↔ Application

**Purpose:** Application also stores which company owns that job.

- Fields:
  - `Application.companyId : String (uuid)` → `Company.companyId`

- Cardinality:
  - Company → Application: `0..*`  
  - Application → Company: `1..1`

- Diagram:
  - Dashed line from **Application** to **Company**.
  - Note: “companyId external reference, used for company dashboard”.

(Although Company is already linked indirectly via JobPost, this direct reference is useful for queries and clear for the examiner.)

---

### 4.3 Applicant ↔ Application (already in JA ERD)

Just ensure the min–max is clearly visible:

- Applicant → Application: `0..*`
- Application → Applicant: `1..1`

This shows the full triplet: **Applicant – Application – JobPost – Company** across both subsystems.

---

### 4.4 SkillTag as Global Catalog

We want **skill matching** to be consistent for both sides.

1. Place `SkillTag` in a central “Skill Catalog Service” or leave it in the Job Post / Profile area but **treat it as global**.

2. Connect:

   - JA.ApplicantSkill → SkillTag  
     - ApplicantSkill → SkillTag: `1..1`  
     - SkillTag → ApplicantSkill: `0..*`  

   - JM.JobPostSkill → SkillTag  
     - JobPostSkill → SkillTag: `1..1`  
     - SkillTag → JobPostSkill: `0..*`  

3. All of these can be solid lines if you think the catalog is physically shared, or dashed lines if each subsystem stores a local copy and syncs via APIs. For simplicity in the diagram:

   - Draw **solid lines** inside the “Skill Catalog Service” block,  
   - And add a small note: “Global catalog, logically shared between JA and JM”.

---

### 4.5 Applicant ↔ ApplicantFlag (JM Applicant Search Service)

`ApplicantFlag` lives on **JM** but references JA’s `Applicant`.

- Fields:
  - `ApplicantFlag.applicantId : String (uuid)` → `Applicant.applicantId`
  - `ApplicantFlag.companyId : String (uuid)` → `Company.companyId` (already in JM ERD)

- Cardinality:
  - Applicant → ApplicantFlag: `0..*`  
    (Different companies can flag the same applicant, or not at all.)
  - ApplicantFlag → Applicant: `1..1`
  - Company → ApplicantFlag: `0..*`
  - ApplicantFlag → Company: `1..1`

- Diagram:
  - Solid line from ApplicantFlag → Company (inside JM).
  - Dashed line from ApplicantFlag → Applicant (cross-system) with note:
    “applicantId external reference (resolved via JA Applicant API)”.

---

### 4.6 Notifications for Both Applicants and Companies

Conceptually there is one **Notification Service** sending messages to both Applicants and Companies.

You can either:

- Keep two Notification tables (JA + JM) that look similar,  
  or
- Draw **one shared `Notification` entity** in the middle.

Recommended: single shared `Notification`:

Notification:
- `notificationId : String (uuid) (PK)`
- `recipientId : String (uuid)` – applicantId or companyId
- `recipientType : String (enum: Applicant | Company)`
- `type : String (enum: JobMatch | SubscriptionReminder | ApplicationUpdate | System)`
- `message : String`
- `channel : String (enum: inApp | email)`
- `isRead : Boolean`
- `timestamp : Date`

Relationships (logical):

- Applicant → Notification: `0..*`
- Company → Notification: `0..*`
- Notification → Applicant / Company: `0..1` (depending on `recipientType`)

Diagram:

- Dashed line from **Notification.recipientId** to **Applicant.applicantId**.
- Dashed line from **Notification.recipientId** to **Company.companyId**.
- Note: “Polymorphic recipient: (recipientId, recipientType), no DB FK”.

---

### 4.7 Shared Payment & Subscription

We want to show that **Payment Service** supports both:

- Applicant Premium subscription (JA side).
- Company Premium subscription (JM side).

1. In the central block, place a single entity:

   - `PaymentTransaction` (shared Payment Service).

2. Leave `Subscription` on each side, but rename them in the diagram for clarity:

   - `ApplicantSubscription` (JA)  
   - `CompanySubscription` (JM)

3. Relationships:

   - ApplicantSubscription → PaymentTransaction  
     - `ApplicantSubscription.lastPaymentTransactionId` → `PaymentTransaction.transactionId`
     - Subscription → PaymentTransaction: `0..*`  
     - PaymentTransaction → Subscription: `0..1`  
     - Dashed line (external reference).

   - CompanySubscription → PaymentTransaction  
     - `CompanySubscription.lastPaymentTransactionId` → `PaymentTransaction.transactionId`
     - Same cardinalities, dashed line.

   - Applicant → PaymentTransaction  
     - Applicant → PaymentTransaction: `0..*`  
     - PaymentTransaction → Applicant: `0..1` (only if transaction belongs to Applicant)
     - Dashed line.

   - Company → PaymentTransaction  
     - Company → PaymentTransaction: `0..*`  
     - PaymentTransaction → Company: `0..1`
     - Dashed line.

4. Notes:

   - “Payment service is shared; both subsystems call the same Payment API.”
   - “No card data stored; only transaction metadata.”

---

### 4.8 Authentication / Authorization

Both subsystems have their own AuthAccount/AuthToken, but conceptually you can:

- **Option A (simpler):** Keep **two copies**:

  - JA: `AuthAccount` ↔ `Applicant`  
  - JM: `AuthAccount` ↔ `Company`  

  Just draw them in their own boxes, with solid lines to Applicant/Company and no cross-link.

- **Option B (more unified):** Show one generalised `AuthAccount` in a shared **Authentication Service**:

AuthAccount:
- `authId : String (uuid)`
- `userId : String (uuid)`      – applicantId or companyId or adminId
- `userType : String (enum: Applicant | Company | Admin)`
- `email : String`
- `passwordHash : String`
- `ssoProvider : String`
- `ssoId : String | null`
- `isActivated : Boolean`
- `failedAttempts : Number`
- `createdAt : Date`
- `updatedAt : Date`

Relationships:

- Applicant → AuthAccount: `0..1` (one auth account per applicant)
- Company → AuthAccount: `0..1`
- SystemAdmin → AuthAccount: `0..1`
- AuthAccount → Applicant/Company/Admin: `0..1` (depending on userType)

Diagram:

- Dashed lines from AuthAccount.userId to Applicant / Company / SystemAdmin with note:
  “Polymorphic user; (userId, userType), no FK.”

Pick the option that best matches what your team agreed on.  
If you keep them separate, just make sure each AuthAccount has:

- One-to-one link with its user entity (`1..1` / `0..1`).
- One-to-many link from AuthAccount to AuthToken.

---

## 5. Cardinality Checklist (Min–Max Summary)

When you finish drawing, quickly check these min–max values:

- **Applicant – Application**  
  - Applicant: `0..*` Applications  
  - Application: `1..1` Applicant  

- **JobPost – Application**  
  - JobPost: `0..*` Applications  
  - Application: `1..1` JobPost  

- **Company – Application**  
  - Company: `0..*` Applications  
  - Application: `1..1` Company  

- **SkillTag – ApplicantSkill**  
  - SkillTag: `0..*` ApplicantSkill  
  - ApplicantSkill: `1..1` SkillTag  

- **SkillTag – JobPostSkill**  
  - SkillTag: `0..*` JobPostSkill  
  - JobPostSkill: `1..1` SkillTag  

- **Applicant – ApplicantFlag**  
  - Applicant: `0..*` ApplicantFlag  
  - ApplicantFlag: `1..1` Applicant  

- **Company – ApplicantFlag**  
  - Company: `0..*` ApplicantFlag  
  - ApplicantFlag: `1..1` Company  

- **Applicant / Company – Notification**  
  - Applicant: `0..*` Notification  
  - Company: `0..*` Notification  
  - Notification: `0..1` Applicant or Company  

- **ApplicantSubscription – PaymentTransaction**  
  - Subscription: `0..*` PaymentTransaction  
  - PaymentTransaction: `0..1` Subscription  

- **CompanySubscription – PaymentTransaction**  
  - Subscription: `0..*` PaymentTransaction  
  - PaymentTransaction: `0..1` Subscription  

- **Applicant / Company / SystemAdmin – AuthAccount** (if unified)  
  - User: `0..1` AuthAccount  
  - AuthAccount: `1..1` User  

- **AuthAccount – AuthToken**  
  - AuthAccount: `0..*` AuthToken  
  - AuthToken: `1..1` AuthAccount  

---

## 6. “Definition of Done” for the Combined ERD

You can use this as a quick checklist for your assignment:

- [ ] All entities from **JA ERD** and **JM ERD** are visible on **one diagram**.
- [ ] Microservice groups are labelled (Applicant Service, Job Post Service, etc.).
- [ ] Legend explains **solid vs dashed** lines and **min–max notation**.
- [ ] Cross-system relationships (Application–JobPost, Application–Company, ApplicantFlag, Payment, Notification, SkillTag) are drawn with **dashed lines** and short notes.
- [ ] Every relationship has **min–max cardinalities** on both ends.
- [ ] Shared services (SkillTag, PaymentTransaction, Notification, possibly Auth) are placed in a central or clearly labelled area.
- [ ] Diagram still respects microservice boundaries (no “fake” foreign keys across DBs).
- [ ] This markdown file is saved as something like  
      `combined-erd-design-guide.md` in `/docs/data-model/`.

Once all of that is ticked, you have a clear, exam-friendly **single ERD for the entire DEVision system**, plus this document explaining how it was constructed.

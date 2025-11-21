# DM-02 — Entities, Attributes & Data Types (Job Manager Subsystem)

> Based on DM-01 – Job Manager  
> Aligned with: JobApplicant DM-01/ERD + Container Diagram + both SRSs  
> DB assumption: PostgreSQL for relational data, Redis for token revocation

For each entity we specify:

- Attributes with types and constraints (conceptual, not DDL)
- Important validation rules
- Notes on how it integrates with other services (especially Applicant side)

---

## 🟦 1. Company

**OwnedByService:** Profile Management Service  
**DBType:** Postgres  
**Sharded:** YES – shardKey = `country`  

### Attributes

- `companyId : String (uuid)` – **PK**, unique company identifier.  
- `companyName : String` – official company name (max ~200 chars).  
- `email : String` – login + contact email, **unique**, case-insensitive.  
- `passwordHash : String | null` – hashed password for local accounts; `null` for SSO-only.  
- `phoneNumber : String | null` – company phone, E.164 format (e.g. `+84…`).  
- `streetAddress : String | null` – street + number.  
- `city : String | null` – city / province.  
- `country : String` – country of operation, used as shard key.  
- `shardKey : String` – same value as `country`.  
- `isEmailVerified : Boolean` – default `false`.  
- `isActive : Boolean` – default `true`; used for soft-delete / suspension.  
- `ssoProvider : String (enum: local | google | microsoft | facebook | github) | null`.  
- `ssoId : String | null` – external identity ID from SSO provider.  
- `isPremium : Boolean` – cached flag derived from latest `Subscription.status`.  
- `createdAt : Date`  
- `updatedAt : Date`

### Validation & Notes

- `email` must be unique; only one active account per email.  
- When `ssoProvider != 'local'` we may allow `passwordHash = null`.  
- Changing `status` of subscriptions should update `isPremium`.

---

## 🟦 2. AuthToken

**OwnedByService:** Authentication Service  
**DBType:** Postgres (metadata) + Redis (revocation)  
**Sharded:** NO  

### Attributes

- `tokenId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – references `Company.companyId`.  
- `accessToken : String` – encrypted JWE access token.  
- `refreshToken : String` – opaque refresh token.  
- `issuedAt : Date` – token issued time.  
- `expiresAt : Date` – token expiry.  
- `isRevoked : Boolean` – default `false`.  
- `failedAttempts : Number` – default `0`.  
- `createdAt : Date`  
- `updatedAt : Date`

### Validation & Notes

- Token is valid only if `isRevoked = false` and `now < expiresAt`.  
- Redis holds a denylist cache keyed by `tokenId` / `jti` for fast revocation checks.

---

## 🟦 3. PublicProfile

**OwnedByService:** Profile Management Service  
**DBType:** Postgres  
**Sharded:** YES (same shard as Company)  

### Attributes

- `companyId : String (uuid)` – **PK**, also FK to `Company`.  
- `displayName : String` – public brand name (often same as `companyName`).  
- `aboutUs : String` – long description.  
- `whoWeAreLookingFor : String` – description of target applicants.  
- `websiteUrl : String | null` – company website.  
- `industryDomain : String` – e.g. “FinTech”, “AI”.  
- `logoUrl : String | null` – logo image URL.  
- `bannerUrl : String | null` – header image URL.  
- `country : String` – public country (duplicated from Company).  
- `city : String | null` – public city.  
- `createdAt : Date`  
- `updatedAt : Date`

---

## 🟦 4. CompanyMedia

**OwnedByService:** Profile Management Service  
**DBType:** Postgres  
**Sharded:** YES  

### Attributes

- `mediaId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – FK to `Company`.  
- `url : String` – media file URL in object storage.  
- `mediaType : String (enum: image | video)`  
- `title : String | null` – short caption.  
- `description : String | null` – longer description.  
- `orderIndex : Number` – display order (default 0).  
- `isActive : Boolean` – default `true`.  
- `uploadedAt : Date`

---

## 🟩 5. JobPost

**OwnedByService:** Job Post Service  
**DBType:** Postgres  
**Sharded:** YES (by `companyId` / `country`)  

### Attributes

- `jobPostId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – FK to `Company`.  
- `title : String` – job title.  
- `description : String` – full job description.  
- `employmentTypes : Array<String>` – values from enum `Full-time | Part-time | Fresher | Internship | Contract`.  
- `postedAt : Date` – publish date/time.  
- `expiryDate : Date | null` – optional expiration.  
- `salaryType : String (enum: RANGE | ABOUT | UP_TO | FROM | NEGOTIABLE)`  
- `salaryMin : Number | null` – required for `RANGE` / `FROM`.  
- `salaryMax : Number | null` – required for `RANGE` / `UP_TO`.  
- `salaryCurrency : String` – e.g. “USD”, “VND”.  
- `city : String | null`  
- `country : String` – used in Applicant search + sharding.  
- `isPublished : Boolean` – default `false`.  
- `status : String (enum: DRAFT | PUBLISHED | ARCHIVED)`  
- `createdAt : Date`  
- `updatedAt : Date`

### Validation

- `employmentTypes`: must not contain both `Full-time` **and** `Part-time` at the same time (mutually exclusive).  
- Salary rules:  
  - `RANGE` → `salaryMin` + `salaryMax` required, `salaryMin ≤ salaryMax`.  
  - `FROM` → `salaryMin` required, `salaryMax` null.  
  - `UP_TO` → `salaryMax` required, `salaryMin` may default to `0`.  
- Only `status = PUBLISHED` and `isPublished = true` should be visible to applicants.

---

## 🟩 6. JobPostSkill (Company-side link to SkillTag)

> **This is the Company version of ApplicantSkill.**  
> We mirror the Applicant naming pattern to avoid mistakes in integration.

**OwnedByService:** Job Post Service  
**DBType:** Postgres  
**Sharded:** YES (same shard as JobPost)  

### Attributes

- `id : String (uuid)` – **PK**.  
- `jobPostId : String (uuid)` – FK to `JobPost.jobPostId`.  
- `skillId : String (uuid)` – FK-by-ID to `SkillTag.skillId` (same catalog as ApplicantSkill).  
- `importance : String (enum: MUST_HAVE | NICE_TO_HAVE)` – requirement level for this skill.  
- `createdAt : Date`  
- `updatedAt : Date`

### Validation & Notes

- There must be **at most one** row per pair (`jobPostId`, `skillId`) – enforce via unique index.  
- This structure intentionally mirrors **ApplicantSkill**:  
  - `id` as primary key.  
  - `skillId` is the same UUID values as on the Applicant side.  
- Any create/update/delete of JobPostSkill should emit a `job-post-updated` event so Applicant search & notifications can refresh safely.

---

## 🟦 7. SkillTag (Shared skill catalog)

> Match **exactly** the Applicant-side SkillTag design (your screenshot) so both sides speak the same language.

**OwnedByService:** Job Post / Skill Catalog Service  
**DBType:** Catalog DB (Mongo/Postgres)  
**Sharded:** NO  

### Attributes

- `skillId : String (uuid)` – **PK**.  
- `name : String (unique, lowercase)` – human-readable skill name; stored lowercase.  
- `category : String | null` – optional grouping (e.g. `frontend`, `database`).  
- `createdAt : Date`

### Notes

- `skillId` is referenced by:  
  - `ApplicantSkill.skillId` (Applicant side)  
  - `JobPostSkill.skillId` (Manager side)  
  - `SearchProfile.technicalBackground` (arrays of `skillId`)  
- All consumers treat this as a **read-only catalog**; updates happen via dedicated admin tools.

---

## 🟨 8. SearchProfile (Company headhunting profile)

**OwnedByService:** Premium Subscription Service / Applicant Search Service  
**DBType:** Postgres  
**Sharded:** YES (by `companyId`)  

### Attributes

- `searchProfileId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – FK to `Company`.  
- `profileName : String` – label, e.g. “Senior Backend VN”.  
- `desiredCountry : String` – target applicant country.  
- `desiredMinSalary : Number` – min expected salary.  
- `desiredMaxSalary : Number | null` – null = no upper bound.  
- `highestEducation : String (enum: Bachelor | Master | Doctorate)`  
- `technicalBackground : Array<String(uuid)>` – list of `skillId` from `SkillTag`.  
- `employmentStatus : Array<String>` – enum values as in `employmentTypes`.  
- `isActive : Boolean` – default `true`.  
- `createdAt : Date`  
- `updatedAt : Date`

### Validation

- If `desiredMaxSalary` not null → `desiredMinSalary ≤ desiredMaxSalary`.  
- `technicalBackground` array should hold valid existing `skillId`s.

---

## 🟨 9. ApplicantFlag

**OwnedByService:** Applicant Search Service  
**DBType:** Postgres  
**Sharded:** YES (by `companyId`)  

### Attributes

- `flagId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – FK to `Company`.  
- `applicantId : String (uuid)` – external ID from Applicant subsystem.  
- `status : String (enum: WARNING | FAVORITE)`  
- `createdAt : Date`  
- `updatedAt : Date`

### Notes

- At most one row with a given `(companyId, applicantId)`; enforce via unique index.  
- Used to display colored badges / icons in search result lists and application detail views.

---

## 🟨 10. Subscription

**OwnedByService:** Subscription Service  
**DBType:** Postgres  
**Sharded:** YES (by `companyId`)  

### Attributes

- `subscriptionId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – FK to `Company`.  
- `planType : String (enum: Free | Premium)`  
- `priceAmount : Number` – subscription fee for current term.  
- `currency : String` – ISO currency code.  
- `startDate : Date`  
- `expiryDate : Date`  
- `status : String (enum: ACTIVE | EXPIRED | CANCELLED | PENDING)`  
- `lastPaymentId : String (uuid) | null` – ID of latest related `PaymentTransaction`.  
- `createdAt : Date`  
- `updatedAt : Date`

### Notes

- Only one `Subscription` per company should have `status = ACTIVE`.  
- `status` is used to maintain `Company.isPremium`.

---

## 🟨 11. PaymentTransaction

**OwnedByService:** Payment Service  
**DBType:** Postgres (global)  
**Sharded:** NO  

### Attributes

- `transactionId : String (uuid)` – **PK**.  
- `companyId : String (uuid)` – string reference to `Company.companyId`.  
- `subscriptionId : String (uuid) | null` – string reference to `Subscription.subscriptionId`.  
- `email : String` – billing email.  
- `amount : Number` – payment amount.  
- `currency : String` – ISO currency code.  
- `gateway : String (enum: Stripe | PayPal)` – or local provider.  
- `timestamp : Date` – transaction time.  
- `status : String (enum: Success | Failed)`  
- `rawGatewayRef : String | null` – transaction code / reference from gateway.

### Notes

- No card numbers, CVV, or other sensitive details are stored.  
- Other services query payments by `transactionId` or `subscriptionId`.

---

## 🟪 12. Notification

**OwnedByService:** Notification Service  
**DBType:** MongoDB or Postgres  
**Sharded:** NO  

### Attributes

- `notificationId : String (uuid)` – **PK**.  
- `recipientId : String (uuid)` – on Job Manager side this is `companyId`.  
- `type : String (enum: JobMatch | SubscriptionReminder | System | ApplicationUpdate)`  
- `message : String` – human-readable text.  
- `channel : String (enum: inApp | email)`  
- `isRead : Boolean` – default `false`.  
- `timestamp : Date`

### Notes

- Created from Kafka events: `applicant-created`, `applicant-updated`, `application-submitted`, `subscription-*` etc.  
- Read/unread status is used by the UI to show notification badges.

---

## Quick Cross-Check with Applicant Side

- **SkillTag**: same attributes (`skillId`, `name`, `category`, `createdAt`) and semantics as in Applicant ERD.  
- **JobPostSkill** vs **ApplicantSkill**: both use `id`, `applicantId`/`jobPostId`, `skillId`, plus extra fields (`proficiency` or `importance`), and timestamps. This symmetry makes it easy to reason about matching and to share `skillId` safely.  
- **Naming**: all attributes now follow the same `camelCase` + `String (uuid)` + `Date` style as in your Applicant diagrams.

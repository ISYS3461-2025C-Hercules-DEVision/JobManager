# Attributes, Types & Validation Rules (DM-02) – Job Manager
> Source: EEET2582_DevVision-JobManager-v1.1.pdf  
> Scope: Sections 1 – 7  
> Milestone 1 Deliverable – Data Model (Level Simplex → Ultimo)

All attributes are preliminary for ER Model v1.

---

## Conventions

- **Type (FE)**: UI form type (text, email, select, file, etc.).
- **Type (BE)**: Database/storage type (PostgreSQL unless noted).
- **Constraint**: `PK`, `FK`, `UNIQUE`, `NOT NULL`, `NULL`, `CHECK`, `INDEX`, `DEFAULT`.
- **Regex** samples are language-agnostic (PCRE/ECMAScript compatible).
- **Shared FE/BE validators** are defined once and reused across forms and DTOs.

### Shared Validation Library (reuse everywhere)

- **Email**
  - Rules: exactly one `@`; at least one `.` after `@`; total length < 255; no spaces; forbid `()[];:`.
  - Regex (syntax check):  
    `^(?!.*[()\[\];:])[^\s@]+@[^\s@]+\.[^\s@]+$`
  - BE: `CHECK (length(email) < 255)` + unique index on `LOWER(email)`.

- **Password strength**
  - Rules: ≥ 8 chars; ≥ 1 digit; ≥ 1 special; ≥ 1 uppercase.
  - Regex:  
    `^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$`

- **Phone (optional)**
  - Rules: starts with `+` and valid dial code (e.g., `+84`, `+49`); digits only after `+`; digits *after* dial code ≤ 12.
  - Regex (format):  
    `^\+[1-9]\d{0,2}\d{1,12}$`
  - BE: custom `CHECK` enforcing local-part length ≤ 12 after dial code.

- **Country**
  - FE: dropdown sourced from ISO-3166-1 alpha-2 list.
  - BE: `CHAR(2)` with `CHECK (country ~ '^[A-Z]{2}$')`.

- **Currency**
  - FE: dropdown from ISO-4217 (e.g., `USD`, `VND`).
  - BE: `CHAR(3)` with `CHECK (currency ~ '^[A-Z]{3}$')`.

- **Image file**
  - FE: accept `image/*`, max 5MB.
  - BE: content-type sniff + size cap; auto-resize (e.g., 512×512) on upload; store URL only.

- **Media file (image / video)**
  - FE: accept `image/*,video/*`, max 50MB.
  - BE: virus scan; store signed URL; do not store binary in DB.

- **Timestamps**
  - `TIMESTAMPTZ`; default `NOW()` on create where appropriate.
  - `updatedAt` maintained by trigger.

---

## 1. Company

Core identity, contact, authentication and sharding info for companies.

| Attribute        | Type (FE)      | Type (BE)                      | Constraint                              | FE rule                                       | BE rule                                                        | Example |
|-----------------|----------------|--------------------------------|-----------------------------------------|-----------------------------------------------|----------------------------------------------------------------|---------|
| companyId       | –              | UUID                           | PK                                      | –                                             | `PRIMARY KEY`                                                 | `8c0c…` |
| companyName     | text           | VARCHAR(150)                   | NOT NULL                                | 1–150 chars; trim; collapse double spaces     | `CHECK (length(companyName) BETWEEN 1 AND 150)`               | `Phuong Hai JSC` |
| email           | email          | CITEXT                         | UNIQUE, NOT NULL                        | email regex; length < 255                     | unique index on `LOWER(email)`; email `CHECK`                 | `hr@company.com` |
| passwordHash    | –              | VARCHAR(255)                   | NULL (SSO) / NOT NULL (local)           | –                                             | hash via Argon2id/BCrypt; `NULL` if `ssoProvider!='local'`    | `$argon2id$…` |
| phoneNumber     | tel            | VARCHAR(20)                    | NULL                                    | optional; phone regex                         | phone regex + custom `CHECK` for local-part length            | `+84901234567` |
| streetAddress   | text           | VARCHAR(180)                   | NULL                                    | ≤180 chars                                   | `CHECK (length(streetAddress) <= 180)`                        | `12 Nguyen Hue, Dist. 1` |
| city            | text           | VARCHAR(120)                   | NULL                                    | ≤120 chars                                   | `CHECK (length(city) <= 120)`                                | `Ho Chi Minh City` |
| country         | select         | CHAR(2)                        | NOT NULL, INDEX, shard key              | must pick from ISO list                       | `CHECK (country ~ '^[A-Z]{2}$')`                             | `VN` |
| shardKey        | –              | CHAR(2)                        | NOT NULL                                | –                                             | `CHECK (shardKey = country)`; used for routing & migrations   | `VN` |
| isEmailVerified | –              | BOOLEAN                        | DEFAULT false                           | –                                             | defaults false; set true after email activation               | `false` → `true` |
| isActive        | toggle         | BOOLEAN                        | DEFAULT true                            | admin/company can deactivate                  | soft delete: block login & writes if `false`                  | `true` |
| ssoProvider     | select         | ENUM('local','google','microsoft','facebook','github') | DEFAULT 'local'           | single choice (project picks **one** actual provider) | enforce only configured provider(s) allowed                   | `google` |
| ssoId           | –              | VARCHAR(128)                   | UNIQUE NULLABLE                         | –                                             | unique when not null                                          | `google-oauth2|123…` |
| isPremium       | –              | BOOLEAN                        | DEFAULT false                           | –                                             | derived from active `CompanySubscription`; keep in sync       | `true` |
| createdAt       | –              | TIMESTAMPTZ                    | DEFAULT NOW()                           | –                                             | set on insert                                                 | – |
| updatedAt       | –              | TIMESTAMPTZ                    | –                                       | –                                             | trigger to auto-update                                        | – |

**Notes**

- Shard key is `country`/`shardKey`; moving a company to a new country triggers shard migration as per Ultimo requirement.
- SSO companies must not have a local password (enforced via `passwordHash` + `ssoProvider` rules).

---

## 2. CompanyAuthToken

Session and security token metadata for companies.

| Attribute     | Type (FE) | Type (BE)   | Constraint                    | FE rule | BE rule                                                                 | Example |
|--------------|-----------|-------------|-------------------------------|--------|-------------------------------------------------------------------------|---------|
| tokenId      | –         | UUID        | PK                            | –      | `PRIMARY KEY`                                                          | – |
| companyId    | –         | UUID        | FK → Company                  | –      | `REFERENCES Company(companyId) ON DELETE CASCADE`                      | – |
| accessToken  | –         | TEXT        | NOT NULL                      | –      | store JWS/JWE token hash or opaque id; set TTL                         | `eyJhbGciOiJ…` |
| refreshToken | –         | TEXT        | NULLABLE                      | –      | rotate; store hash; TTL (e.g., 30 days)                                | – |
| issuedAt     | –         | TIMESTAMPTZ | NOT NULL                      | –      | set on login                                                           | – |
| expiresAt    | –         | TIMESTAMPTZ | NOT NULL                      | –      | must be > `issuedAt`; DB `CHECK`                                      | – |
| isRevoked    | –         | BOOLEAN     | DEFAULT false                 | –      | mirror Redis deny-list/cache                                           | `false` |
| failedAttempts | –       | SMALLINT    | DEFAULT 0                     | –      | throttle: lock token or account after ≥5 within window                 | `0`–`5` |

**Notes**

- Multiple active tokens per company (multi-device support).
- Logout = revoke in Redis + set `isRevoked=true`.

---

## 3. CompanyPublicProfile

Public-facing company profile visible to applicants.

| Attribute          | Type (FE)    | Type (BE)     | Constraint      | FE rule                                    | BE rule                                              | Example |
|--------------------|--------------|---------------|-----------------|--------------------------------------------|------------------------------------------------------|---------|
| companyId          | –            | UUID          | PK, FK → Company | –                                         | 1:1 with Company; `PRIMARY KEY` + `REFERENCES`      | – |
| displayName        | text         | VARCHAR(150)  | NOT NULL        | 1–150 chars; trim                          | `CHECK (length(displayName) BETWEEN 1 AND 150)`     | `DevVision Labs` |
| aboutUs            | textarea     | TEXT          | NULL            | ≤4000 chars                               | length check                                         | company mission |
| whoWeAreLookingFor | textarea     | TEXT          | NULL            | ≤2000 chars                               | length check                                         | desired candidate traits |
| websiteUrl         | url          | TEXT          | NULL            | must start with `http://` or `https://`   | `CHECK (websiteUrl ~ '^https?://')` when not null   | `https://devvision.io` |
| industryDomain     | select/text  | VARCHAR(80)   | NOT NULL        | must choose from allowed list or enter    | optional `CHECK` against controlled vocabulary       | `FinTech` |
| logoUrl            | file (image) | TEXT          | NULL            | image upload; ≤5MB                        | store URL; resize to standard size (e.g., 256×256)   | `https://cdn/logo.png` |
| bannerUrl          | file (image) | TEXT          | NULL            | image upload; ≤5MB                        | store URL; optional                                 | `https://cdn/banner.png` |
| country            | –            | CHAR(2)       | NOT NULL        | –                                         | duplicated from Company for query optimization       | `VN` |
| city               | –            | VARCHAR(120)  | NULL            | –                                         | copy from Company.city or override                   | `Hanoi` |
| createdAt          | –            | TIMESTAMPTZ   | DEFAULT NOW()   | –                                         | –                                                    | – |
| updatedAt          | –            | TIMESTAMPTZ   | –               | –                                         | trigger                                              | – |

**Notes**

- Company CRUD UI may combine `Company` + `CompanyPublicProfile` in a single form, but DB keeps them separate.

---

## 4. CompanyMedia

Gallery of media assets (images/videos) associated with a company profile.

| Attribute   | Type (FE)     | Type (BE)     | Constraint      | FE rule                          | BE rule                                      | Example |
|------------|---------------|---------------|-----------------|----------------------------------|----------------------------------------------|---------|
| mediaId    | –             | UUID          | PK              | –                                | `PRIMARY KEY`                                 | – |
| companyId  | –             | UUID          | FK → Company    | –                                | `REFERENCES Company(companyId) ON DELETE CASCADE` | – |
| fileUrl    | –             | TEXT          | NOT NULL        | –                                | signed URL; virus scan                        | `https://…/event1.jpg` |
| mediaType  | select        | ENUM('image','video') | NOT NULL | radio/select                    | enum check                                    | `image` |
| title      | text          | VARCHAR(120)  | NULL            | ≤120 chars                      | length check                                  | `Year-end party` |
| description| textarea      | TEXT          | NULL            | ≤1,000 chars                    | length check                                  | – |
| orderIndex | number        | INT           | DEFAULT 0       | non-negative integer            | `CHECK (orderIndex >= 0)`                    | `0`,`1`,`2` |
| isActive   | toggle        | BOOLEAN       | DEFAULT true    | show/hide media                 | used as soft delete                           | `true` |
| uploadedAt | –             | TIMESTAMPTZ   | DEFAULT NOW()   | –                                | –                                            | – |

---

## 5. JobPost

Job posts created by companies (public or private).

| Attribute       | Type (FE)      | Type (BE)          | Constraint        | FE rule                                                                 | BE rule                                                                                               | Example |
|-----------------|----------------|--------------------|-------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|---------|
| jobPostId       | –              | UUID               | PK                | –                                                                       | `PRIMARY KEY`                                                                                         | – |
| companyId       | –              | UUID               | FK → Company      | –                                                                       | `REFERENCES Company(companyId) ON DELETE CASCADE`                                                    | – |
| title           | text           | VARCHAR(150)       | NOT NULL          | 1–150 chars                                                             | `CHECK (length(title) BETWEEN 1 AND 150)`                                                            | `Senior Backend Engineer` |
| description     | textarea       | TEXT               | NOT NULL          | rich text allowed; min length (e.g., ≥50)                              | minimal length `CHECK`                                                                               | full job description |
| employmentTypes | multiselect    | JSONB              | NOT NULL          | choose 1+ from {Full-time, Part-time, Internship, Contract, Fresher}   | validate JSON array; enforce: Full-time XOR Part-time; allow Internship/Contract/Fresher combination | `["Full-time","Internship"]` |
| postedAt        | –              | TIMESTAMPTZ        | NULL              | auto set when first published (not on create draft)                    | when `status` transitions to `PUBLISHED`, set `postedAt` if null                                     | – |
| expiryDate      | date           | DATE               | NULL              | ≥ posted date                                                          | `CHECK (expiryDate IS NULL OR expiryDate >= postedAt::date)`                                        | `2026-01-31` |
| salaryType      | select         | ENUM('RANGE','ABOUT','UP_TO','FROM','NEGOTIABLE') | NOT NULL | single choice                                      | enum check                                                                                           | `RANGE` |
| salaryMin       | number         | NUMERIC(10,2)      | NULL              | ≥0; required when type = RANGE/FROM                                   | `CHECK (salaryMin IS NULL OR salaryMin >= 0)`; additional `CHECK` vs `salaryType`                    | `1000.00` |
| salaryMax       | number         | NUMERIC(10,2)      | NULL              | ≥0; required when type = RANGE/UP_TO                                  | `CHECK (salaryMax IS NULL OR salaryMax >= 0)`; `CHECK (salaryMax IS NULL OR salaryMax >= salaryMin)` | `1500.00` |
| salaryCurrency  | select         | CHAR(3)            | NOT NULL          | ISO currency list                                                      | `CHECK (salaryCurrency ~ '^[A-Z]{3}$')`                                                              | `USD` |
| city            | text           | VARCHAR(120)       | NULL              | ≤120 chars                                                             | length check                                                                                          | `Da Nang` |
| country         | select         | CHAR(2)            | NOT NULL          | must pick one country                                                 | shard-aligned with Company.country; `CHECK (country ~ '^[A-Z]{2}$')`                                  | `VN` |
| isPublished     | toggle         | BOOLEAN            | DEFAULT false     | controls visibility                                                    | `CHECK (isPublished = (status = 'PUBLISHED'))` if enforced                                           | `true` |
| status          | select         | ENUM('DRAFT','PUBLISHED','ARCHIVED') | DEFAULT 'DRAFT' | radio/select                      | enum check; business rules around transitions (Draft → Published → Archived)                         | `PUBLISHED` |
| createdAt       | –              | TIMESTAMPTZ        | DEFAULT NOW()     | –                                                                       | –                                                                                                     | – |
| updatedAt       | –              | TIMESTAMPTZ        | –                 | –                                                                       | trigger                                                                                               | – |

**Notes**

- Any change to `country` or associated `JobPostSkill` entries triggers a Kafka event for real-time applicant notifications.
- `employmentTypes` is stored as JSONB to support multi-select and simple containment queries.

---

## 6. JobPostSkill (junction)

Normalized N:M link between JobPost and SkillTag.

| Attribute  | Type (FE) | Type (BE) | Constraint           | FE rule        | BE rule                          | Example |
|-----------|-----------|-----------|----------------------|----------------|----------------------------------|---------|
| jobPostId | –         | UUID      | PK part, FK → JobPost | –             | FK; part of composite PK         | – |
| skillId   | –         | UUID      | PK part, FK → SkillTag | –            | FK; part of composite PK         | – |
| importance| select    | ENUM('MUST_HAVE','NICE_TO_HAVE') | NULL         | optional single choice           | enum check                       | `MUST_HAVE` |

**Notes**

- Composite PK `(jobPostId, skillId)`; unique per pair.
- Insert/update/delete operations on this table are candidates for Kafka publishing.

---

## 7. SkillTag

Shared catalog of technical skills and competencies (logically shared with Applicant subsystem).

| Attribute | Type (FE) | Type (BE)   | Constraint            | FE rule                     | BE rule                              | Example |
|----------|-----------|-------------|-----------------------|-----------------------------|--------------------------------------|---------|
| skillId  | –         | UUID        | PK                    | –                           | `PRIMARY KEY`                        | – |
| name     | text      | CITEXT      | UNIQUE, NOT NULL      | 1–50 chars; trim; no emoji  | unique case-insensitive; length `CHECK` | `React` |
| category | text      | VARCHAR(50) | NULL                  | optional                    | –                                    | `Backend` |
| isActive | toggle    | BOOLEAN     | DEFAULT true          | allow deactivate            | recommended soft-delete; prevent new links when false | `true` |
| createdAt| –         | TIMESTAMPTZ | DEFAULT NOW()         | –                           | –                                    | – |

---

## 8. CompanySearchProfile (Premium)

Saved “Applicant Searching Profile” for premium companies (real-time matching).

| Attribute           | Type (FE)   | Type (BE)         | Constraint      | FE rule                                                  | BE rule                                                                 | Example |
|---------------------|------------|-------------------|-----------------|----------------------------------------------------------|-------------------------------------------------------------------------|---------|
| searchProfileId     | –          | UUID              | PK              | –                                                        | `PRIMARY KEY`                                                           | – |
| companyId           | –          | UUID              | FK → Company    | –                                                        | `REFERENCES Company(companyId) ON DELETE CASCADE`                      | – |
| profileName         | text       | VARCHAR(100)      | NULL            | ≤100 chars                                               | length check                                                            | `VN Senior Backend` |
| desiredCountry      | select     | CHAR(2)           | NULL            | ISO list; optional                                       | `CHECK (desiredCountry ~ '^[A-Z]{2}$')` when not null                  | `VN` |
| desiredMinSalary    | number     | NUMERIC(10,2)     | DEFAULT 0       | ≥0                                                      | `CHECK (desiredMinSalary >= 0)`                                        | `0.00` |
| desiredMaxSalary    | number     | NUMERIC(10,2)     | NULL            | ≥ min; or empty for “no limit”                           | `CHECK (desiredMaxSalary IS NULL OR desiredMaxSalary >= desiredMinSalary)` | – |
| highestEducation    | select     | ENUM('Bachelor','Master','Doctorate') | NULL | single choice; optional filter            | enum check                                                              | `Bachelor` |
| technicalBackground | tags       | JSONB             | NULL            | tag list                                                 | validate array of non-empty strings; normalise to SkillTag where needed | `["Kafka","React"]` |
| employmentStatus    | multiselect| JSONB             | NULL            | values from {Full-time, Part-time, Internship, Contract, Fresher} | validate allowed set; JSONB array                                      | `["Full-time","Contract"]` |
| isActive            | toggle     | BOOLEAN           | DEFAULT true    | can enable/disable profile                               | only active profiles considered by matching service                     | `true` |
| createdAt           | –          | TIMESTAMPTZ       | DEFAULT NOW()   | –                                                        | –                                                                       | – |
| updatedAt           | –          | TIMESTAMPTZ       | –               | –                                                        | trigger                                                                 | – |

**Notes**

- Premium matching: for each relevant Applicant event, Kafka consumer queries active `CompanySearchProfile` rows and generates `CompanyNotification`.

---

## 9. CompanySubscription

Tracks premium subscription state and history per company.

| Attribute      | Type (FE) | Type (BE)                                   | Constraint           | FE rule                           | BE rule                                                                                  | Example |
|----------------|-----------|---------------------------------------------|----------------------|-----------------------------------|------------------------------------------------------------------------------------------|---------|
| subscriptionId | –         | UUID                                        | PK                   | –                                 | `PRIMARY KEY`                                                                            | – |
| companyId      | –         | UUID                                        | FK → Company         | –                                 | `REFERENCES Company(companyId) ON DELETE CASCADE`                                       | – |
| planType       | select    | ENUM('Free','Premium')                      | NOT NULL             | single choice                     | enum check                                                                               | `Premium` |
| priceAmount    | number    | NUMERIC(10,2)                               | NOT NULL             | ≥0                                | `CHECK (priceAmount >= 0)`                                                               | `30.00` |
| currency       | select    | CHAR(3)                                     | NOT NULL             | ISO list                          | `CHECK (currency ~ '^[A-Z]{3}$')`                                                        | `USD` |
| startDate      | datetime  | TIMESTAMPTZ                                 | NOT NULL             | cannot be in the past when creating future subscription | `CHECK (startDate <= expiryDate)`                                                       | – |
| expiryDate     | datetime  | TIMESTAMPTZ                                 | NOT NULL             | > startDate                      | `CHECK (expiryDate > startDate)`                                                        | – |
| status         | select    | ENUM('ACTIVE','EXPIRED','CANCELLED','PENDING') | NOT NULL         | badge/select                      | DB or service logic keeps consistency with dates                                        | `ACTIVE` |
| createdAt      | –         | TIMESTAMPTZ                                 | DEFAULT NOW()        | –                                 | –                                                                                        | – |
| updatedAt      | –         | TIMESTAMPTZ                                 | –                    | –                                 | trigger                                                                                  | – |

**Notes**

- At most **one** `CompanySubscription` with `status='ACTIVE'` per `companyId` at any time (enforced in service or via partial unique index).
- `Company.isPremium` is a denormalised view of current active subscription.

---

## 10. PaymentTransaction

Records each payment event for company subscriptions (payment microservice).

| Attribute      | Type (FE) | Type (BE)                         | Constraint           | FE rule                                | BE rule                                                                             | Example |
|----------------|-----------|-----------------------------------|----------------------|----------------------------------------|-------------------------------------------------------------------------------------|---------|
| transactionId  | –         | UUID                              | PK                   | –                                      | `PRIMARY KEY`                                                                       | – |
| companyId      | –         | UUID                              | FK → Company         | –                                      | `REFERENCES Company(companyId) ON DELETE CASCADE`                                   | – |
| subscriptionId | –         | UUID                              | FK → CompanySubscription | NULL (for initial or failed attempts) | `REFERENCES CompanySubscription(subscriptionId)`                                    | – |
| email          | email     | CITEXT                            | NOT NULL            | email regex                            | billing email; same validator as Company.email                                      | `billing@company.com` |
| amount         | number    | NUMERIC(10,2)                     | NOT NULL             | ≥0                                     | `CHECK (amount >= 0)`                                                                | `30.00` |
| currency       | select    | CHAR(3)                           | NOT NULL             | ISO list                               | `CHECK (currency ~ '^[A-Z]{3}$')`                                                   | `USD` |
| gateway        | select    | ENUM('Stripe','PayPal')           | NOT NULL             | single choice                          | enum check                                                                          | `Stripe` |
| timestamp      | –         | TIMESTAMPTZ                       | NOT NULL             | –                                      | default `NOW()` at insertion                                                        | – |
| status         | badge     | ENUM('Success','Failed')          | NOT NULL             | set after gateway response             | enum check                                                                          | `Success` |
| rawGatewayRef  | text      | VARCHAR(255)                      | NULL                 | optional                               | store gateway transaction id / payload ref                                         | `ch_3Nh…` |

**Notes**

- Payment service is owned by Job Manager team; Job Applicant subsystem only consumes its API.
- Useful for audit, refunds and debugging payment issues.

---

## 11. CompanyNotification

In-system notifications and real-time Kafka messages delivered to companies.

| Attribute      | Type (FE) | Type (BE)                                 | Constraint        | FE rule                               | BE rule                                | Example |
|----------------|-----------|-------------------------------------------|-------------------|---------------------------------------|----------------------------------------|---------|
| notificationId | –         | UUID                                      | PK                | –                                     | `PRIMARY KEY`                           | – |
| companyId      | –         | UUID                                      | FK → Company      | –                                     | `REFERENCES Company(companyId) ON DELETE CASCADE` | – |
| type           | badge     | ENUM('ApplicantMatch','SubscriptionReminder','System') | NOT NULL | badge styling based on type           | enum check                             | `ApplicantMatch` |
| message        | text      | TEXT                                      | NOT NULL          | ≤2,000 chars                          | length check                            | human-readable text |
| channel        | select    | ENUM('inApp','email')                     | NOT NULL          | single choice                         | enum check                             | `inApp` |
| isRead         | toggle    | BOOLEAN                                   | DEFAULT false     | toggle in UI                          | –                                      | `false` |
| createdAt      | –         | TIMESTAMPTZ                               | DEFAULT NOW()     | –                                     | –                                      | – |

**Notes**

- For email notifications, the actual send status may be tracked separately (e.g., in logs or extended schema), but this table is the source of truth for what the system intended to notify.

---

# 📌 DM-02 — Entities & Data Types (Job Manager Subsystem)
> Based on: DM-01 Entities List — Job Manager  
> Scope: Sections 1–7 of EEET2582_DevVision-JobManager-v1.1.pdf

This document refines **DM-01** by specifying attribute-level data types and constraints for each entity in the Job Manager subsystem.

Conventions:

- **String (uuid)** – RFC-4122 UUID stored as string.
- **Date** – ISO 8601 date-time in UTC.
- **Number** – Numeric type (`int` / `decimal`) depending on usage.
- `| null` – attribute may be absent / NULL.
- **PK** – Primary Key, **FK** – Foreign Key, **UQ** – Unique.

---

## 🟦 1. Company

Core organisational profile of a hiring company.

| Attribute    | Type           | Constraints / Default                        | Description |
|-------------|----------------|----------------------------------------------|-------------|
| companyId   | String (uuid)  | PK, generated UUID                           | Company identifier used across services. |
| companyName | String         | required                                     | Official company name. |
| phoneNumber | String         | optional                                     | Contact phone (international format). |
| streetAddress | String       | optional                                     | Street + number. |
| city        | String         | optional                                     | City or region. |
| country     | String         | required                                     | Country of operation. |
| shardKey    | String         | required, = `country`                        | Partition key for sharding. |
| isActive    | Boolean        | default: `true`                              | Whether the company account is enabled. |
| isPremium   | Boolean        | default: `false`                             | Denormalised flag from Subscription status. |
| createdAt   | Date           | required                                     | Creation timestamp. |
| updatedAt   | Date           | required                                     | Last update timestamp. |

---

## 🟧 2. AuthAccount (Authentication – Login Identity)

Login identity and credentials for a company account.

| Attribute      | Type            | Constraints / Default                         | Description |
|---------------|-----------------|-----------------------------------------------|-------------|
| authId        | String (uuid)   | PK, generated UUID                            | Authentication account ID. |
| companyId     | String (uuid)   | FK → `Company.companyId`, required           | Linked company. |
| email         | String          | required, UQ, lowercase                       | Login email. |
| passwordHash  | String          | nullable (for SSO-only accounts)              | Hashed password. |
| isEmailVerified | Boolean       | default: `false`                              | Email verification status. |
| ssoProvider   | String          | enum: `local` \| `google` \| `microsoft` \| `facebook` \| `github`; nullable | Source of authentication. |
| ssoId         | String          | nullable                                      | External SSO subject identifier. |
| createdAt     | Date            | required                                      | Creation timestamp. |
| updatedAt     | Date            | required                                      | Last update timestamp. |

---

## 🟪 3. AuthToken (Authorization – API Access Token)

Metadata for access/refresh tokens issued after authentication.

| Attribute      | Type           | Constraints / Default                         | Description |
|----------------|----------------|-----------------------------------------------|-------------|
| tokenId        | String (uuid)  | PK, generated UUID                            | Token identifier. |
| authId         | String (uuid)  | FK → `AuthAccount.authId`, required           | Owning auth account. |
| accessToken    | String         | required                                      | Encrypted JWE / JWT string. |
| refreshToken   | String         | required                                      | Long-lived refresh token. |
| issuedAt       | Date           | required                                      | Issued timestamp. |
| expiresAt      | Date           | required                                      | Expiry timestamp. |
| isRevoked      | Boolean        | default: `false`                              | Revocation flag (used with Redis denylist). |
| failedAttempts | Number         | default: `0`                                  | Failed login attempts (for brute-force protection). |
| createdAt      | Date           | required                                      | Creation timestamp. |
| updatedAt      | Date           | required                                      | Last update timestamp. |

---

## 🟦 4. PublicProfile

Public employer brand information visible to applicants.

| Attribute          | Type           | Constraints / Default                        | Description |
|--------------------|----------------|----------------------------------------------|-------------|
| companyId          | String (uuid)  | PK, FK → `Company.companyId`                 | Same ID as Company (1:1). |
| displayName        | String         | required                                     | Public display / brand name. |
| aboutUs            | String         | optional (text)                              | “About us” content. |
| whoWeAreLookingFor | String         | optional (text)                              | Description of desired candidates. |
| websiteUrl         | String         | optional                                     | Public website URL. |
| industryDomain     | String         | required                                     | Industry / CS domain (FinTech, AI, etc.). |
| logoUrl            | String         | optional                                     | Logo image URL. |
| bannerUrl          | String         | optional                                     | Header/banner image URL. |
| country            | String         | required                                     | Publicly displayed country. |
| city               | String         | optional                                     | Publicly displayed city. |
| createdAt          | Date           | required                                     | Creation timestamp. |
| updatedAt          | Date           | required                                     | Last update timestamp. |

---

## 🟦 5. CompanyMedia

Profile gallery media.

| Attribute   | Type           | Constraints / Default                         | Description |
|------------|----------------|-----------------------------------------------|-------------|
| mediaId    | String (uuid)  | PK                                            | Media identifier. |
| companyId  | String (uuid)  | FK → `Company.companyId`, required           | Owning company. |
| url        | String         | required                                      | Object storage URL. |
| mediaType  | String         | enum: `image` \| `video`, required            | Type of media. |
| title      | String         | optional                                      | Short caption / title. |
| description| String         | optional (text)                               | Longer description. |
| orderIndex | Number         | optional                                      | Ordering index in gallery. |
| isActive   | Boolean        | default: `true`                               | Soft-delete flag. |
| uploadedAt | Date           | required                                      | Upload timestamp. |

---

## 🟧 6. JobPost

Company job posting.

| Attribute       | Type            | Constraints / Default                         | Description |
|-----------------|-----------------|-----------------------------------------------|-------------|
| jobPostId       | String (uuid)   | PK                                            | Job post identifier. |
| companyId       | String (uuid)   | FK → `Company.companyId`, required           | Owning company. |
| title           | String          | required                                      | Job title. |
| description     | String          | required (text)                               | Full job description. |
| employmentTypes | Array\<String>  | required, values from enum: `Full-time`, `Part-time`, `Fresher`, `Internship`, `Contract` | Supported employment types. |
| postedAt        | Date            | required                                      | Published/created date. |
| expiryDate      | Date            | optional                                      | Post expiry date. |
| salaryType      | String          | enum: `RANGE` \| `ABOUT` \| `UP_TO` \| `FROM` \| `NEGOTIABLE`, required | How salary is represented. |
| salaryMin       | Number          | optional; required when `salaryType` ∈ {`RANGE`,`FROM`} | Minimum salary. |
| salaryMax       | Number          | optional; required when `salaryType` ∈ {`RANGE`,`UP_TO`} | Maximum salary. |
| salaryCurrency  | String          | required (e.g. `USD`, `VND`)                  | Currency code. |
| city            | String          | optional                                      | Job location city. |
| country         | String          | required                                      | Job location country. |
| isPublished     | Boolean         | default: `false`                              | Visible to applicants when `true`. |
| status          | String          | enum: `DRAFT` \| `PUBLISHED` \| `ARCHIVED`, required | Lifecycle state. |
| createdAt       | Date            | required                                      | Creation timestamp. |
| updatedAt       | Date            | required                                      | Last update timestamp. |

---

## 🟧 7. JobPostSkill

Mapping between JobPost and SkillTag.

| Attribute  | Type           | Constraints / Default                         | Description |
|-----------|----------------|-----------------------------------------------|-------------|
| id        | String (uuid)  | PK                                            | Link row identifier. |
| jobPostId | String (uuid)  | FK → `JobPost.jobPostId`, required           | Related job post. |
| skillId   | String (uuid)  | FK → `SkillTag.skillId`, required            | Required skill. |
| importance| String         | enum: `MUST_HAVE` \| `NICE_TO_HAVE`, required | Importance level. |
| createdAt | Date           | required                                      | Creation timestamp. |
| updatedAt | Date           | required                                      | Last update timestamp. |

Business constraint: `(jobPostId, skillId)` must be unique.

---

## 🟦 8. SkillTag

Global skill catalog.

| Attribute | Type           | Constraints / Default              | Description |
|----------|----------------|------------------------------------|-------------|
| skillId  | String (uuid)  | PK                                 | Skill identifier. |
| name     | String         | required, lowercase, UQ            | Human-readable name (e.g. `react`, `kafka`). |
| category | String         | optional                           | Category/group (e.g. `frontend`, `database`). |
| createdAt| Date           | required                           | Creation timestamp. |

---

## 🟨 9. SearchProfile

Saved company headhunting profile.

| Attribute           | Type               | Constraints / Default                         | Description |
|---------------------|--------------------|-----------------------------------------------|-------------|
| searchProfileId     | String (uuid)      | PK                                            | Search profile identifier. |
| companyId           | String (uuid)      | FK → `Company.companyId`, required           | Owning company. |
| profileName         | String             | required                                      | Human-readable label (e.g. “Backend VN Senior”). |
| desiredCountry      | String             | required                                      | Target applicant country. |
| desiredMinSalary    | Number             | required                                      | Minimum desired salary. |
| desiredMaxSalary    | Number             | optional                                      | Maximum desired salary (null = no upper bound). |
| highestEducation    | String             | enum: `Bachelor` \| `Master` \| `Doctorate`, required | Minimum education level. |
| technicalBackground | Array\<String>     | required, list of `SkillTag.skillId`         | Desired technical skills. |
| employmentStatus    | Array\<String>     | values from enum: `Full-time`, `Part-time`, `Fresher`, `Internship`, `Contract` | Accepted employment statuses. |
| isActive            | Boolean            | default: `false`                              | Included in real-time matching when `true`. |
| createdAt           | Date               | required                                      | Creation timestamp. |
| updatedAt           | Date               | required                                      | Last update timestamp. |

---

## 🟨 10. ApplicantFlag

Per-company classification of applicants as favorite/warning.

| Attribute   | Type           | Constraints / Default                         | Description |
|------------|----------------|-----------------------------------------------|-------------|
| flagId     | String (uuid)  | PK                                            | Flag row identifier. |
| companyId  | String (uuid)  | FK → `Company.companyId`, required           | Owning company. |
| applicantId| String (uuid)  | external ID from Applicant subsystem, required | Target applicant ID (no DB-level FK). |
| status     | String         | enum: `WARNING` \| `FAVORITE`, required       | Flag value. |
| createdAt  | Date           | required                                      | Creation timestamp. |
| updatedAt  | Date           | required                                      | Last update timestamp. |

Business constraint: `(companyId, applicantId)` must be unique.

---

## 🟨 11. Subscription

Premium company subscription.

| Attribute      | Type           | Constraints / Default                         | Description |
|----------------|----------------|-----------------------------------------------|-------------|
| subscriptionId | String (uuid)  | PK                                            | Subscription identifier. |
| companyId      | String (uuid)  | FK → `Company.companyId`, required           | Subscribed company. |
| planType       | String         | enum: `Free` \| `Premium`, required          | Plan type. |
| priceAmount    | Number         | required                                      | Price per billing cycle. |
| currency       | String         | required                                      | Currency code. |
| startDate      | Date           | required                                      | Subscription start date. |
| expiryDate     | Date           | required                                      | Subscription end date. |
| status         | String         | enum: `ACTIVE` \| `EXPIRED` \| `CANCELLED` \| `PENDING`, required | Current status. |
| lastPaymentId  | String (uuid)  | optional, ref → `PaymentTransaction.transactionId` | Last successful payment. |
| createdAt      | Date           | required                                      | Creation timestamp. |
| updatedAt      | Date           | required                                      | Last update timestamp. |

---

## 🟨 12. PaymentTransaction

Payment attempts for company subscriptions.

| Attribute      | Type           | Constraints / Default                         | Description |
|----------------|----------------|-----------------------------------------------|-------------|
| transactionId  | String (uuid)  | PK                                            | Payment transaction ID. |
| companyId      | String (uuid)  | required, string reference to Company        | Paying company ID (no cross-service FK). |
| subscriptionId | String (uuid)  | optional, string reference to Subscription   | Related subscription record. |
| email          | String         | required                                      | Billing email used at gateway. |
| amount         | Number         | required                                      | Amount charged. |
| currency       | String         | required                                      | Currency code. |
| gateway        | String         | enum: `Stripe` \| `PayPal`, required          | Payment provider. |
| timestamp      | Date           | required                                      | Time the payment was processed. |
| status         | String         | enum: `Success` \| `Failed`, required         | Outcome. |
| rawGatewayRef  | String         | optional                                      | Provider transaction reference. |

---

## 🟪 13. Notification

Notifications for companies.

| Attribute      | Type           | Constraints / Default                         | Description |
|----------------|----------------|-----------------------------------------------|-------------|
| notificationId | String (uuid)  | PK                                            | Notification identifier. |
| recipientId    | String (uuid)  | required, string reference to `Company.companyId` | Company receiving the notification. |
| type           | String         | enum: `JobMatch` \| `SubscriptionReminder` \| `System` \| `ApplicationUpdate`, required | Notification category. |
| message        | String         | required (text)                               | Message content. |
| channel        | String         | enum: `inApp` \| `email`, required            | Delivery channel. |
| isRead         | Boolean        | default: `false`                              | Read/acknowledged flag (for in-app). |
| timestamp      | Date           | required                                      | Creation / send time. |

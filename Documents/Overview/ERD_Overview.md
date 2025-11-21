# DEVision – Job Manager Subsystem Entity Relationship Design Overview

## 1. Purpose

The Entity Relationship Diagram (ERD) defines the core data model for the **Job Manager** subsystem of the DEVision platform.  
It is structured around clear service boundaries (Authentication, Profile Management, Job Post, Subscription, Payment, Notification, Applicant Search), while preserving a single, coherent view of a company and its interactions with applicants.

The model is optimised for:

- Strong ownership of data per service boundary  
- Traceability of all company-side activities (job posts, subscriptions, payments, alerts)  
- Support for premium features such as real-time matching and head-hunting  

---

## 2. Service-Aligned Domains and Core Entities

### 2.1 Authentication & Authorization Services

#### AuthAccount

Represents the authentication identity for a company user.

- Stores login credentials (email, password hash) and account metadata (status, timestamps, failed attempts).  
- Serves as the entry point for login, password management, and security policies.  
- Decoupled from business data to minimise exposure of sensitive information.

#### AuthToken

Captures issued access tokens for authenticated sessions.

- Tracks token ID, associated account, expiry, and revocation status.  
- Enables auditability of active sessions and secure logout / blacklist flows.  
- Supports token-based authentication across Job Manager APIs.

---

### 2.2 Profile Management Service

#### Company

Master record for the hiring organisation.

- Contains legal and operational information such as name, contact details, industry, country, and verification flags.  
- Stores provider metadata for social sign-in where applicable.  
- Acts as the primary parent entity for most Job Manager data (job posts, subscriptions, media, transactions, notifications, search profiles, applicant flags).

#### PublicProfile

Presentation-focused view of the company, optimised for what applicants see on the platform.

- Holds display name, “about us” text, website and social URLs, and “who we are looking for” messaging.  
- Maintains a 1:1 relationship with `Company`, allowing changes to public branding without altering core company data.  
- Used by the applicant-facing subsystem when rendering employer pages.

#### CompanyMedia

Stores media assets associated with the company.

- References external storage via URL and describes media type (image, video, etc.).  
- Includes caption, sort order, and archival flags.  
- Supports rich, branded employer profiles while keeping large binary assets out of core tables.

---

### 2.3 Job Post Service

#### JobPost

Central entity for representing an open position published by a company.

- Contains title, description, employment types, location, and salary configuration (min/max, type, currency).  
- Maintains publication flags and lifecycle status (Draft / Published / Archived).  
- Linked to `Company`, enabling each organisation to manage multiple roles over time.

#### JobPostSkill

Defines individual skill requirements attached to a specific `JobPost`.

- Captures skill identifier, proficiency level, endorsements or weighting, and timestamps.  
- Enables structured querying, search filtering, and downstream matching to applicant skills.  

#### SkillTag

Canonical skill vocabulary shared across the platform.

- Stores unique, normalised skill names and optional category information.  
- Acts as a reference list for `JobPostSkill` and other skill-related features.  
- Supports analytics and reporting on in-demand skills.

---

### 2.4 Subscription Service

#### Subscription

Represents a company’s subscription to Job Manager premium offerings.

- Tracks plan type (e.g. Free, Premium), billing cycle, and subscription status (Active, Expired, Cancelled, Pending).  
- References the company and optionally the latest successful `PaymentTransaction`.  
- Serves as the single source of truth for entitlement checks across the system.

#### SearchProfile

Stores saved “Applicant Searching Profile” definitions for head-hunting.

- Defines matching criteria such as skills, experience range, education level, salary expectations, locations, industries, and job types.  
- Tightly linked to `Company` as company-owned search criteria.  
- Used by the matching engine to evaluate new or updated applicants and trigger notifications.

---

### 2.5 Payment Service

#### PaymentTransaction

Records all monetary transactions processed for subscriptions.

- Contains transaction amount, currency, payment gateway, timestamps, and status (Success / Failed).  
- Optionally references a `Subscription` to associate payments with plans.  
- Stores gateway reference data to support reconciliation and dispute handling.

---

### 2.6 Notification Service

#### Notification

Represents a discrete notification delivered to a company account.

- Includes recipient identifier, notification type (JobMatch, SubscriptionReminder, System, ApplicationUpdate), channel (in-app, email), read flag, and timestamp.  
- Linked to `Company` to allow company-specific inboxes and audit trails.  
- Supports both synchronous and asynchronous alert workflows.

---

### 2.7 Applicant Search Service (Company-Side View)

#### ApplicantFlag

Provides company-specific annotations on applicants.

- Contains the pair `(companyId, applicantId)` as a unique key.  
- Stores status or flags such as “favorite”, “warning”, or custom labels.  
- Enables shortlist, follow-up, and risk-flag workflows in the Job Manager UI without duplicating full applicant profiles.

---

## 3. Key Relationships and Ownership

- `Company` is the **central aggregate root** for the Job Manager side:  
  one company can own many `JobPost`, `Subscription`, `PaymentTransaction`, `Notification`, `CompanyMedia`, `SearchProfile`, and `ApplicantFlag` records.

- Authentication and authorization are **logically separated**:  
  `AuthAccount` and `AuthToken` reference company identities but live in their own security-focused service.

- Subscription, payment, and notification flows are **loosely coupled**:  
  `Subscription` references `PaymentTransaction` for billing history, while `Notification` represents downstream events such as match alerts or renewal reminders.

- Applicant-related entities like `ApplicantFlag` and `SearchProfile` form a **bridge** between company preferences and applicant data held in the separate Job Applicant subsystem, avoiding duplication of applicant records.

This structure supports clear microservice boundaries, strong data ownership, and extensibility for future features such as analytics dashboards or additional subscription tiers.

---

## 4. Design Characteristics

- **Service-oriented modelling** – each cluster of entities maps directly to a logical backend service, simplifying deployment and ownership.  
- **Auditability** – most entities maintain `createdAt` and `updatedAt` timestamps, and transactional entities record gateway references and statuses.  
- **Normalisation with pragmatic denormalisation** – core master data (Company, SkillTag) is normalised, while flexible fields (arrays of skills, employment types) support efficient querying and matching.  
- **Event-driven readiness** – entities such as `Notification` and `SearchProfile` are designed to integrate cleanly with Kafka-based matching and alert pipelines defined in the architecture tasks.

This ERD provides a robust foundation for the Job Manager backend, aligning with the overall DEVision architecture and supporting both current assignment requirements and future evolution of the platform.

---

## 5. Entity Usage Summary

The table below summarises how each entity is used within the Job Manager subsystem and which domain it primarily belongs to.

| Entity              | Service Boundary            | Primary Usage / Responsibility                                                                                           |
|---------------------|----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **AuthAccount**     | Authentication Service      | Stores credentials and account metadata for company users; used during login, password reset, and security checks.       |
| **AuthToken**       | Authorization Service       | Represents issued access tokens; used for API authentication, session management, and token revocation.                  |
| **Company**         | Profile Management Service  | Master company record; parent for job posts, subscriptions, media, notifications, search profiles, and applicant flags. |
| **PublicProfile**   | Profile Management Service  | Public-facing employer profile; used by applicant UI when rendering company pages and branding content.                 |
| **CompanyMedia**    | Profile Management Service  | Stores media assets (logo, photos, videos); used to enrich the company public profile and marketing content.            |
| **JobPost**         | Job Post Service            | Represents an advertised position; used for job listing, applicant applications, and analytics.                          |
| **JobPostSkill**    | Job Post Service            | Captures required skills per job post; used for search filters and matching algorithms.                                  |
| **SkillTag**        | Shared / Job Post Service   | Canonical skill dictionary; used to normalise skills across job posts and applicant profiles.                            |
| **Subscription**    | Subscription Service        | Tracks company plan, status, and entitlement; consulted whenever premium features are accessed.                          |
| **SearchProfile**   | Subscription / Matching     | Stores company head-hunting criteria; used by matching engine to trigger job match notifications.                        |
| **PaymentTransaction** | Payment Service         | Records subscription payments; used for billing history, reconciliation, and linking to subscription status.            |
| **Notification**    | Notification Service        | Represents alerts sent to companies; used for in-app notification center and email dispatch.                             |
| **ApplicantFlag**   | Applicant Search Service    | Stores company-specific flags for applicants; used to manage favourites, warnings, and other review states.             |

---

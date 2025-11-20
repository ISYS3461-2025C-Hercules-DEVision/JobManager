# DEVision – Job Manager Subsystem Overview

## 1. System Context

DEVision is a two-sided recruitment platform that connects Computer Science job applicants with hiring companies.  
The **Job Manager subsystem** is the company-facing side of this ecosystem. It enables organisations to register, manage their employer brand, publish job posts, search applicants, and subscribe to real-time talent notifications.  

The Job Manager subsystem cooperates with the **Job Applicant subsystem** through well-defined REST APIs and an event-driven messaging layer.

---

## 2. Purpose and Scope

The Job Manager subsystem aims to:

- Provide a secure and efficient platform for companies to manage recruitment activities.
- Expose high-quality APIs for cross-subsystem integration with the Job Applicant subsystem.
- Support premium, real-time headhunting capabilities for companies via subscription.
- Ensure the system can scale with increasing numbers of companies, job posts, and applicants.

The scope includes backend microservices, web frontend, data persistence, messaging infrastructure, and integration endpoints.

---

## 3. Primary Users and Stakeholders

- **Company Representatives** – HR staff, recruiters, hiring managers who manage profiles, job posts, and applicants.
- **System Administrators / Operators** – maintain deployments, infrastructure, monitoring, and configuration.
- **DEVision Ecosystem** – the Job Applicant subsystem and any external tools that consume Job Manager APIs.

---

## 4. Core Functional Capabilities

### 4.1 Company Onboarding and Authentication

- Company registration with validation of mandatory organisational details.
- Secure login using email/password and token-based authentication.
- Management of company account status (active, suspended, premium).

### 4.2 Company Profile Management

- Create and update a public company profile including description, logo, locations, and tech stack.
- Display public profile data for consumption by the Job Applicant subsystem and applicants.

### 4.3 Job Post Management

- Create, edit, publish, archive, and delete job posts.
- Capture structured job information: title, description, responsibilities, requirements, salary range, employment type, and location.
- Support filtering and search of job posts by various criteria.

### 4.4 Applicant Search and Shortlisting

- Search applicants (via APIs from the Job Applicant subsystem) based on technical background, desired salary, employment status, location, and education level.
- View applicant profiles and job applications related to the company’s job posts.
- Mark applicants as **Favorite** or **Warning** and surface these statuses in search results and detail views.

### 4.5 Premium Company Subscription and Notifications

- Provide a monthly subscription for premium companies using a third-party payment provider.
- Record subscription status, transaction metadata, and expiry.
- Maintain saved “headhunting profiles” describing the company’s desired candidate criteria.
- Deliver **real-time notifications** when new or updated applicant profiles match a company’s saved criteria via a Kafka-based notification service.

### 4.6 Payment and Billing

- Expose a Payment API to support subscription purchase from both Job Manager and Job Applicant sides.
- Integrate with external payment gateways (e.g. Stripe/PayPal) and persist transaction records.

---

## 5. High-Level Architecture

The Job Manager subsystem adopts a **microservices-oriented architecture** with an API-driven and event-driven integration style.

### 5.1 Logical Components

- **Job Manager Frontend**
  - Web client used by company users to manage profiles, job posts, and applicants.
  - Communicates exclusively with backend APIs through an API Gateway.

- **Backend Microservices**
  - **Company Service** – manages company accounts, authentication integration, and profile data.
  - **Job Post Service** – manages lifecycle of job posts and their public exposure.
  - **Applicant Search Service** – orchestrates calls to Job Applicant APIs and applies company-specific filters, favorites, and warnings.
  - **Subscription & Payment Service** – handles subscription plans, payment processing, and premium status.
  - **Notification Service** – Kafka consumer that evaluates applicant events and pushes notifications to premium companies.

- **Shared Infrastructure**
  - **API Gateway & Service Discovery** – entry point for external requests, routing to backend microservices and enabling service registration and discovery.
  - **Relational Database** – persists company, job, and subscription data with appropriate indexing and sharding strategy for scalability.
  - **Redis Cache** – accelerates frequent reads (e.g. popular job posts, search filters) and reduces database load.
  - **Kafka Cluster** – provides publish/subscribe channels for real-time events between Job Manager and Job Applicant subsystems.
  - **Observability Stack** – logging, metrics, and tracing to support monitoring, alerting, and troubleshooting.

---

## 6. Integration with Job Applicant Subsystem

The Job Manager subsystem participates in a bi-directional integration model:

- **APIs provided to Job Applicant subsystem**
  - Company public profile data
  - Public job post data
  - Subscription payment API
  - Job Manager system authorization and token validation (when required)

- **APIs consumed from Job Applicant subsystem**
  - Applicant profile data
  - Job application data (who applied to which job)
  - Job Applicant system authorization (where Applicant-side services control access)

- **Event-driven communication**
  - Applicant profile creation/update events published from Job Applicant through Kafka.
  - Job Manager notification service consumes these events, evaluates them against premium companies’ search profiles, and triggers notifications.

---

## 7. Deployment Overview

- All core components (frontend, backend microservices, database, Redis, Kafka, API Gateway, Service Discovery) are **containerized** using Docker.
- Components are deployed across one or more virtual machines / cloud instances, separating concerns as follows:
  - Frontend, backend services, and cache may share a host in lower environments.
  - Kafka, API Gateway, and Service Discovery are hosted on separate nodes to isolate infrastructure concerns.
  - Backend microservices are distributed across at least two machines to improve resilience and scalability.
- Future enhancement: deploy the full DEVision ecosystem to a container-orchestration platform (e.g. Kubernetes) for automated scaling and self-healing.

---

## 8. Non-Functional Requirements

The Job Manager subsystem is designed to satisfy the following quality attributes:

- **Scalability** – horizontal scaling of stateless microservices and Kafka consumers to support high volumes of companies and applicants.
- **Availability** – health checks, load balancing, and fault-tolerant messaging to minimise downtime.
- **Security** – secure authentication, role-based authorisation, input validation, and protection of personal data in transit and at rest.
- **Performance** – efficient querying, caching, and asynchronous processing for responsive user experience.
- **Maintainability** – modular service boundaries, clean API contracts, and consistent coding standards to facilitate evolution.
- **Observability** – centralised logging, metrics, and tracing for diagnosis and capacity planning.

---

## 9. Summary

The Job Manager subsystem is a microservices-based, API-first platform that enables companies to manage recruitment activities and leverage real-time talent discovery. Through tight integration with the Job Applicant subsystem and an event-driven notification model, it delivers an industrial-grade foundation for scalable and maintainable recruitment services within the DEVision ecosystem.

# DeVision Platform Architecture

This document outlines the high-level container architecture for the DeVision Platform.

## Component Breakdown

### 1\. Actors

* **Company:** Organizations utilizing the platform to find talent.
* **Admin:** System administrators with elevated privileges for managing users and system configuration.

### 2\. DeVision Platform (Internal)

* **Job Manager Frontend (React):** A Single Page Application (SPA) acting as the primary interface for all users.
* **Backend (Spring Boot/Java):** The core application handling business logic and orchestrating communication between the frontend, databases, and external services.
* **Data & Messaging Layer:**
  * **PostgreSQL:** The primary source of truth for transactional data.
  * **Redis:** In-memory caching to improve performance.
  * **Kafka:** Handles asynchronous events and messaging.

### 3\. External Systems

* **Authentication Systems:** Handles Single Sign-On (SSO) capabilities.
* **Payment Systems:** External gateway for processing payments.
* **Notification Systems:** Handles outgoing email communications.
* **Partner Systems:** External integration for fetching job applicant data.

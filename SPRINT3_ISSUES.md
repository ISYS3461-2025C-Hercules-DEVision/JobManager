# Sprint 3: GitHub Issues for Scrum Board

---

## 🏗️ ARCHITECTURE ISSUES

### Issue #1: Split Monolith into Microservices (Auth, Core, Search)
**Label:** `backend` `architecture` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 8

**Description:**
Refactor the monolithic application into separate microservices:
- **Authentication Service** (Port 8080): User registration, login, JWT, OAuth
- **Company Service** (Port 8081): Company profiles, public profiles, media
- **Job Service** (Port 8088): Job posting, search, applications
- **Subscription Service** (Port 8083): Payment, subscriptions, search profiles
- **Notification Service** (Port 8084): Email, real-time notifications

**Acceptance Criteria:**
- [ ] Each service runs independently with its own database
- [ ] Services communicate via REST APIs and Kafka
- [ ] No circular dependencies between services
- [ ] Each service has its own Dockerfile

**Reference:** PDF A.3.1

---

### Issue #2: Setup Kafka & API Gateway + Service Discovery
**Label:** `infrastructure` `kafka` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 5

**Description:**
Implement event-driven architecture and API Gateway:
- **Kong API Gateway** (Port 8000): Single entry point, JWT validation, routing
- **Eureka Service Discovery** (Port 8761): Service registration and discovery
- **Kafka** (AWS MSK): Event streaming for async communication

**Acceptance Criteria:**
- [ ] Kong routes all requests to appropriate microservices
- [ ] Eureka discovers all running services automatically
- [ ] Kafka topics created: `company-registration`, `subscription-created`, `subscription-activated`
- [ ] All services publish/consume Kafka events

**Technical Details:**
```yaml
# Kong Routes
/authentication/* → authentication-service:8080
/companies/* → company-service:8081
/jobs/* → job-service:8088
/subscriptions/* → subscription-service:8083
```

**Reference:** PDF D.3.x

---

### Issue #3: Database Sharding Implementation (Shard by Country)
**Label:** `backend` `database` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 8

**Description:**
Implement MongoDB sharding strategy using Country as shard key to optimize applicant/company search.

**Technical Requirements:**
- Shard key: `country` field in User/Company collections
- MongoDB Sharded Cluster configuration
- Indexes on country + other search fields

**Acceptance Criteria:**
- [ ] MongoDB sharding configured in production
- [ ] Country field is mandatory in registration
- [ ] Query performance improved for location-based searches
- [ ] Shard distribution is balanced across regions

**Implementation:**
```javascript
// Enable sharding
sh.enableSharding("mongodb-company")
sh.shardCollection("mongodb-company.companies", { "country": 1 })

// Indexes
db.companies.createIndex({ country: 1, industry: 1 })
db.applicants.createIndex({ country: 1, skills: 1 })
```

**Reference:** PDF 1.3.3

---

## 🔐 AUTHENTICATION & SECURITY ISSUES

### Issue #4: Implement SSO (Google/GitHub/Microsoft/Facebook)
**Label:** `backend` `authentication` `OAuth` `sprint-3`  
**Assignee:** BE-2  
**Sprint:** Sprint 3  
**Story Points:** 5

**Description:**
Implement Single Sign-On with multiple OAuth providers.

**Providers to Support:**
1. ✅ Google OAuth 2.0 (Already implemented)
2. ❌ GitHub OAuth
3. ❌ Microsoft OAuth
4. ❌ Facebook OAuth

**Acceptance Criteria:**
- [ ] Users can register/login with all 4 providers
- [ ] OAuth users cannot set password (provider field = GOOGLE/GITHUB/etc.)
- [ ] User profile auto-populated from OAuth provider data
- [ ] Redirect URI configured correctly for each provider

**Environment Variables Needed:**
```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=...

MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

**Reference:** PDF 1.3.1

---

### Issue #5: Redis Caching for Token Revocation
**Label:** `backend` `security` `redis` `sprint-3`  
**Assignee:** BE-2  
**Sprint:** Sprint 3  
**Story Points:** 3

**Description:**
Implement token blacklist using Redis for logout functionality.

**Current Status:** ✅ Code implemented but needs testing

**Acceptance Criteria:**
- [ ] Logout endpoint adds token to Redis blacklist
- [ ] Blacklist TTL = remaining token lifetime
- [ ] JWT filter checks blacklist before processing requests
- [ ] Refresh tokens are revoked on logout

**Files Modified:**
- `Backend/authentication/src/main/java/com/job/manager/authentication/service/TokenBlacklistService.java`
- `Backend/authentication/src/main/java/com/job/manager/authentication/controller/AuthenticationController.java` (logout endpoint)

**Test Cases:**
- [ ] User logout → token blacklisted
- [ ] Use revoked token → 401 Unauthorized
- [ ] Token expires → auto-removed from Redis

**Reference:** PDF 2.3.2

---

## 📬 KAFKA & NOTIFICATION ISSUES

### Issue #6: Kafka Producer/Consumer - Job Update Notifications
**Label:** `backend` `kafka` `notification` `sprint-3`  
**Assignee:** BE-3  
**Sprint:** Sprint 3  
**Story Points:** 5

**Description:**
Notify applicants when a job they applied for is updated.

**Flow:**
1. Company updates job (status/description/requirements)
2. Job Service publishes Kafka event: `job-updated`
3. Notification Service consumes event
4. Notification Service queries applicants who applied
5. Send email/in-app notification to each applicant

**Kafka Event Schema:**
```json
{
  "eventType": "job-updated",
  "jobId": "job123",
  "companyId": "comp456",
  "changes": ["status", "salary"],
  "timestamp": "2026-01-08T10:00:00Z"
}
```

**Acceptance Criteria:**
- [ ] Job Service publishes `job-updated` event
- [ ] Notification Service consumes and sends emails
- [ ] Email template created: "Job Update Notification"
- [ ] Applicants can opt-out of job update emails

**Reference:** PDF 4.3.1

---

### Issue #7: Kafka Producer/Consumer - Applicant Match Notifications
**Label:** `backend` `kafka` `notification` `sprint-3`  
**Assignee:** BE-3  
**Sprint:** Sprint 3  
**Story Points:** 8

**Description:**
Notify companies when an applicant matching their search profile registers/updates CV.

**Flow:**
1. Applicant registers or updates profile
2. Applicant Service publishes `applicant-profile-updated` event
3. Notification Service consumes event
4. Match against company search profiles (from Subscription Service)
5. Send notification to matching companies

**Matching Logic:**
```javascript
// Match criteria from SearchProfile
- Skills overlap >= 70%
- Desired salary within range
- Location matches (country/city)
- Employment status = "Looking for job"
```

**Acceptance Criteria:**
- [ ] Applicant Service publishes profile events
- [ ] Notification Service has matching algorithm
- [ ] Only PREMIUM companies receive notifications
- [ ] Email template: "New Candidate Match"
- [ ] Dashboard shows match notifications

**Reference:** PDF 6.3.1

---

## 🎨 FRONTEND ISSUES

### Issue #8: Implement Headless UI Components (Tables, Lists)
**Label:** `frontend` `UI` `sprint-3`  
**Assignee:** FE-1  
**Sprint:** Sprint 3  
**Story Points:** 5

**Description:**
Build reusable Headless UI components with Tailwind CSS.

**Components Needed:**
- **DataTable**: Sortable, filterable, paginated table
- **CardList**: Grid/List view toggle for jobs/applicants
- **Pagination**: Previous/Next + page numbers
- **FilterPanel**: Multi-select filters (location, salary, skills)

**Acceptance Criteria:**
- [ ] Components are framework-agnostic (Headless UI)
- [ ] Fully accessible (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Used in Job List and Applicant Search pages

**Tech Stack:**
- Headless UI (React)
- Tailwind CSS
- React Table or TanStack Table

**Reference:** PDF A.3.a

---

### Issue #9: SSO Login Integration & Payment Flow Finalization
**Label:** `frontend` `authentication` `payment` `sprint-3`  
**Assignee:** FE-1  
**Sprint:** Sprint 3  
**Story Points:** 5

**Description:**
Complete frontend integration for OAuth login and Stripe payment flow.

**OAuth Login:**
- [ ] Google login button redirects to OAuth consent screen
- [ ] Handle OAuth callback and store JWT token
- [ ] Redirect to dashboard after successful login

**Payment Flow:**
- [x] Create subscription → Get Stripe checkout URL
- [x] Redirect to Stripe checkout
- [x] Handle success callback
- [ ] **FIX:** Poll `/profile/status` to confirm subscription activated
- [ ] Show success modal with subscription details

**Current Issue:**
- Stripe webhook activates subscription
- Frontend needs to wait for activation before redirecting

**Files:**
- `Frontend/src/modules/auth/components/GoogleLoginButton.jsx`
- `Frontend/src/modules/payment/hooks/usePayment.js`
- `Frontend/src/pages/PaymentSuccess.jsx`

**Reference:** PDF 1.3.1

---

### Issue #10: Real-time Notification UI (WebSocket or Polling)
**Label:** `frontend` `notification` `real-time` `sprint-3`  
**Assignee:** FE-2  
**Sprint:** Sprint 3  
**Story Points:** 8

**Description:**
Implement real-time notification system in the dashboard.

**Options:**
1. **WebSocket** (preferred): Persistent connection, push notifications
2. **Server-Sent Events (SSE)**: One-way server push
3. **Polling** (fallback): GET `/notifications` every 30s

**Features:**
- [ ] Bell icon with unread count badge
- [ ] Dropdown notification list
- [ ] Mark as read/unread
- [ ] Different notification types (job update, match, system)
- [ ] Click notification → navigate to related page

**Backend Endpoint:**
```
GET /notifications/{companyId}
POST /notifications/{id}/read
```

**WebSocket Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8084/notifications/ws?token=JWT_TOKEN')
ws.onmessage = (event) => {
  // Display toast notification
}
```

**Reference:** PDF - (Real-time Notification UI)

---

### Issue #11: View CV/Cover Letter Capability
**Label:** `frontend` `feature` `sprint-3`  
**Assignee:** FE-2  
**Sprint:** Sprint 3  
**Story Points:** 3

**Description:**
Allow companies to view applicant CVs and cover letters.

**Features:**
- [ ] PDF viewer modal for CV
- [ ] Download CV button
- [ ] Cover letter displayed in text area
- [ ] Navigate between multiple applicants

**Tech Stack:**
- React PDF Viewer (`react-pdf` or `@react-pdf-viewer/core`)
- File upload validation (PDF, max 5MB)

**API Integration:**
```
GET /applicants/{id}/cv
GET /applicants/{id}/cover-letter
```

**Reference:** PDF 4.3.2

---

## 🗄️ DATABASE & DEVOPS ISSUES

### Issue #12: Database Seed Script (Admin + Test Data)
**Label:** `database` `devops` `sprint-3`  
**Assignee:** All  
**Sprint:** Sprint 3  
**Story Points:** 3

**Description:**
Create seed script to populate databases with test data for demo.

**Data Requirements:**
- **1 Admin User**: Full permissions
- **4 Companies**: 2 FREE, 2 PREMIUM
- **5 Applicants**: Various skills, locations
- **10 Jobs**: Different industries, locations
- **2 Subscriptions**: Active subscriptions for PREMIUM companies

**Script Location:**
`/Backend/scripts/seed-database.js`

**Acceptance Criteria:**
- [ ] Script runs idempotently (can run multiple times)
- [ ] Passwords are hashed with bcrypt
- [ ] Email verification codes generated
- [ ] Companies have public profiles
- [ ] Jobs are active and searchable

**Sample Data:**
```javascript
companies = [
  { name: "TechCorp VN", country: "VN", isPremium: true },
  { name: "StartupX SG", country: "SG", isPremium: true },
  { name: "SmallBiz AU", country: "AU", isPremium: false },
  { name: "Local Shop VN", country: "VN", isPremium: false }
]

applicants = [
  { name: "John Doe", skills: ["Java", "Spring"], country: "VN" },
  { name: "Jane Smith", skills: ["React", "Node.js"], country: "SG" },
  ...
]
```

**Reference:** PDF M2 Req

---

### Issue #13: Dockerize All Services + Kubernetes YAMLs (Bonus)
**Label:** `devops` `docker` `kubernetes` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 8

**Description:**
Dockerize all microservices and create Kubernetes deployment manifests.

**Current Status:** ✅ Dockerfiles exist for all services

**Docker Compose:**
- [ ] `docker-compose.yml` for local development
- [ ] All services + MongoDB + Kafka + Redis

**Kubernetes (Bonus):**
- [ ] Deployment YAMLs for each service
- [ ] Service YAMLs (ClusterIP, LoadBalancer)
- [ ] ConfigMaps for environment variables
- [ ] Secrets for sensitive data (SMTP, JWT keys)
- [ ] Persistent Volume Claims for databases

**Files to Create:**
```
/Backend/docker-compose.yml
/Backend/k8s/
  ├── authentication-deployment.yaml
  ├── company-deployment.yaml
  ├── job-deployment.yaml
  ├── subscription-deployment.yaml
  ├── notification-deployment.yaml
  ├── kong-deployment.yaml
  ├── eureka-deployment.yaml
  └── configmap.yaml
```

**Reference:** PDF D.3.4

---

## 🐛 BUG FIXES

### Issue #14: Fix SMTP Authentication Failed in Production
**Label:** `bug` `production` `critical` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 2

**Description:**
Email verification not working in production due to revoked Gmail App Password.

**Root Cause:**
- ECS Task Definition uses old SMTP password: `audr bfnw hzns cyvm` (revoked)
- New password in `.env`: `rjpg zllt teqc roow` (not deployed)

**Solution:**
1. Update ECS Task Definition revision 20
2. Set `SMTP_PASSWORD=rjpg zllt teqc roow`
3. Force new deployment
4. Test registration flow

**CloudWatch Error:**
```
[WARN] Failed to send email via SMTP. 
Error: Authentication failed
```

**Acceptance Criteria:**
- [ ] Update ECS Task Definition with new SMTP password
- [ ] Email verification works in production
- [ ] Users receive OTP codes successfully
- [ ] CloudWatch logs show "Verification email sent successfully"

**Files:**
- AWS ECS Task Definition: `job-manager-authentication:20`
- Environment variable: `SMTP_PASSWORD`

---

### Issue #15: Frontend Payment Success Page Not Redirecting
**Label:** `bug` `frontend` `payment` `sprint-3`  
**Assignee:** FE-1  
**Sprint:** Sprint 3  
**Story Points:** 2

**Description:**
After successful Stripe payment, user stuck on `/payment/success` page with blank screen.

**Root Cause:**
- Stripe webhook activates subscription asynchronously
- Frontend calls `/payments/complete` immediately
- Payment status still PENDING → Frontend doesn't redirect

**Solution:**
Add polling mechanism to wait for subscription activation:

```javascript
// Frontend/src/pages/PaymentSuccess.jsx
useEffect(() => {
  const pollStatus = async () => {
    const response = await fetch(`/payments/complete?sessionId=${sessionId}`)
    if (response.status === 'SUCCESS') {
      // Check subscription status
      const sub = await fetch(`/subscriptions/${subscriptionId}`)
      if (sub.status === 'ACTIVE') {
        navigate('/dashboard')
      } else {
        // Retry after 2s
        setTimeout(pollStatus, 2000)
      }
    }
  }
  pollStatus()
}, [])
```

**Acceptance Criteria:**
- [ ] Frontend polls payment status every 2 seconds
- [ ] Max 10 retries (20 seconds)
- [ ] Redirect to dashboard when subscription ACTIVE
- [ ] Show error message if payment failed

---

## 📝 DOCUMENTATION

### Issue #16: Update README with Deployment Instructions
**Label:** `documentation` `sprint-3`  
**Assignee:** BE-1  
**Sprint:** Sprint 3  
**Story Points:** 2

**Description:**
Update project README with complete setup, build, and deployment instructions.

**Sections to Add:**
1. **Architecture Diagram**: Microservices + Kafka + API Gateway
2. **Prerequisites**: Node.js, Java, Docker, AWS CLI
3. **Local Development**:
   - Start MongoDB, Redis, Kafka via Docker Compose
   - Run each service: `./gradlew bootRun`
   - Run frontend: `npm run dev`
4. **Environment Variables**: List all required vars for each service
5. **Deployment**:
   - Build Docker images
   - Push to ECR
   - Deploy to ECS
6. **Troubleshooting**: Common issues and solutions

**File:** `/README.md`

---

## 📊 SUMMARY

**Total Issues:** 16  
**Total Story Points:** 76

**By Category:**
- Architecture: 3 issues (21 points)
- Authentication & Security: 2 issues (8 points)
- Kafka & Notifications: 2 issues (13 points)
- Frontend: 4 issues (21 points)
- Database & DevOps: 2 issues (11 points)
- Bug Fixes: 2 issues (4 points)
- Documentation: 1 issue (2 points)

**Sprint Goal:** Deliver fully functioning microservices system with real-time notifications, SSO, and production deployment.

---

Copy these issues into your GitHub repository or project management tool (Jira, Linear, etc.)!

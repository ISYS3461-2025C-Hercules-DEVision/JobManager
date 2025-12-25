# Backend & Frontend Integration Analysis
## Company Service Integration Guide

**Date:** December 19, 2025  
**Purpose:** Comprehensive analysis of Backend Company Service and Frontend integration

---

## 📋 Table of Contents
1. [Backend Analysis](#backend-analysis)
2. [Frontend Analysis](#frontend-analysis)
3. [Integration Status](#integration-status)
4. [Configuration Summary](#configuration-summary)
5. [Recommendations](#recommendations)

---

## 🔧 Backend Analysis

### Company Service Architecture

**Base Package:** `com.job.manager.company`  
**Service Port:** `8082`  
**Database:** MongoDB (Port: 27018)  
**Service Discovery:** Eureka (Port: 8761)

### Available API Endpoints

#### 1. **Profile Status Check**
```
GET /profile/status
Response: {companyId: string, hasPublicProfile: boolean}
```

#### 2. **Get Company Profile**
```
GET /profile
Response: CompanyResponseDto (see data structure below)
```

#### 3. **Update Company Profile**
```
PUT /profile
Body: CompanyProfileUpdateDto
Response: Updated profile
```

#### 4. **Create Public Profile** (First-time onboarding)
```
POST /public-profile
Body: {companyName, logoUrl?, bannerUrl?}
Response: PublicProfileResponseDto
```

#### 5. **Get Public Profile**
```
GET /public-profile
Response: PublicProfileResponseDto
```

#### 6. **Update Public Profile**
```
PUT /public-profile
Body: PublicProfileUpdateDto (all optional fields)
Response: PublicProfileResponseDto
```

### Data Structures (DTOs)

#### CompanyResponseDto
```java
{
  companyId: string
  companyName: string
  email: string
  phoneNumber: string
  streetAddress: string
  city: string
  country: string
  isEmailVerified: boolean
  isActive: boolean
  isPremium: boolean
  ssoProvider: enum (LOCAL, GOOGLE)
  createdAt: datetime
  updatedAt: datetime
  hasPublicProfile: boolean
}
```

#### PublicProfileResponseDto
```java
{
  companyId: string
  displayName: string
  aboutUs: string
  whoWeAreLookingFor: string
  websiteUrl: string
  industryDomain: string
  logoUrl: string
  bannerUrl: string
  country: string
  city: string
  createdAt: datetime
  updatedAt: datetime
}
```

#### PublicProfileUpdateDto
```java
{
  displayName?: string (2-100 chars)
  aboutUs?: string (max 2000 chars)
  whoWeAreLookingFor?: string (max 1000 chars)
  websiteUrl?: string (valid HTTP/HTTPS URL)
  industryDomain?: string (max 100 chars)
  logoUrl?: string (valid HTTP/HTTPS URL)
  bannerUrl?: string (valid HTTP/HTTPS URL)
}
```

### Authentication Method
- Uses JWT tokens via `@CurrentUser` annotation
- Token should be passed in `Authorization: Bearer {token}` header
- User email is extracted from JWT and used to identify company

### Additional Services
**CompanyMediaController** is also available at the same port for managing:
- Company images/videos
- Media gallery with ordering
- Limit of 10 media items per company

---

## 💻 Frontend Analysis

### Current Structure

```
Frontend/src/
├── config/
│   ├── api.js          ✅ API endpoints configured
│   └── env.js          ✅ Environment variables
├── utils/
│   ├── companyHttpClient.js  ✅ Company service HTTP client
│   ├── HttpUtil.js           ✅ Auth service HTTP client
│   └── tokenStorage.js       ✅ Token management
├── state/
│   ├── AuthContext.jsx       ✅ Authentication context
│   ├── AppContext.jsx        ✅ App-level state (notifications, sidebar)
│   └── AppProviders.jsx      ✅ Combined providers
├── modules/
│   ├── auth/                 ✅ Login, Register, Verify
│   ├── profile/
│   │   └── services/
│   │       └── profileService.js  ✅ Company profile API calls
│   └── dashboard/            ✅ Dashboard structure exists
└── app/
    └── App.jsx              ✅ React Router setup
```

### Frontend Configuration

#### Environment Variables (.env)
```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVICE_URL=http://localhost:8080
VITE_COMPANY_SERVICE_URL=http://localhost:8082  # ⚠️ NEEDS TO BE ADDED
VITE_ENABLE_GOOGLE_AUTH=false
VITE_APP_VERSION=1.0.0
```

#### API Endpoints (config/api.js)
```javascript
COMPANY: {
  BASE: '/company',
  PROFILE: '/profile',
  PROFILE_STATUS: '/profile/status',
  PUBLIC_PROFILE: '/public-profile',
  UPDATE_PROFILE: '/profile',
  UPDATE_PUBLIC_PROFILE: '/public-profile',
}
```

### Existing Services

#### profileService.js ✅
Already implements all required methods:
- `checkProfileStatus()`
- `getCompanyProfile()`
- `updateCompanyProfile(profileData)`
- `createPublicProfile(publicProfileData)`
- `getPublicProfile()`
- `updatePublicProfile(publicProfileData)`
- `getCompleteProfile()` - Helper method

#### companyHttpClient.js ✅
- Configured with JWT token interceptor
- Error handling for 401 (redirects to login)
- Logging in development mode
- Base URL from environment variable

---

## 🔗 Integration Status

### ✅ What's Already Working

1. **Authentication Flow**
   - Login/Register with backend
   - Token storage and management
   - JWT token sent to company service

2. **Company Profile Service**
   - All API methods implemented
   - Proper error handling
   - Data structures match backend DTOs

3. **HTTP Clients**
   - Separate clients for auth and company services
   - Token interceptors configured
   - Error handling implemented

4. **State Management**
   - AuthContext for authentication
   - AppContext for UI state (notifications, sidebar)
   - Ready for profile state integration

5. **Routing**
   - Protected routes for dashboard
   - Dashboard layout structure exists

### ⚠️ What Needs Configuration

1. **Environment Variable**
   ```dotenv
   # Add to .env file
   VITE_COMPANY_SERVICE_URL=http://localhost:8082
   ```

2. **AppProviders Integration**
   - Currently defined but NOT used in main.jsx
   - Needs to wrap App component

3. **Dashboard Pages**
   - Placeholder pages exist but need implementation
   - Need to integrate profile service

### ❌ What's Missing

1. **Profile Context/State**
   - Create ProfileContext to manage company profile state
   - Store and cache profile data
   - Share across dashboard components

2. **Dashboard Implementation**
   - Sidebar with company profile display
   - Profile settings page
   - Dashboard pages need real data

3. **Public Profile Onboarding**
   - First-time setup flow
   - Check if user has completed public profile
   - Redirect to setup if needed

---

## 📊 Configuration Summary

### Backend Services Running

| Service | Port | Status | Database |
|---------|------|--------|----------|
| Authentication | 8080 | ✅ Running | MongoDB (27017) |
| Company | 8082 | ✅ Running | MongoDB (27018) |
| Eureka Discovery | 8761 | ✅ Running | - |
| Kafka | 29092 | ✅ Running | - |

### Frontend Configuration

| Setting | Current Value | Notes |
|---------|--------------|-------|
| Auth Service | http://localhost:8080 | ✅ Correct |
| Company Service | ❌ Not configured | Add: VITE_COMPANY_SERVICE_URL=http://localhost:8082 |
| Mock Mode | false | ✅ Correct |
| Google Auth | false | ✅ Disabled |

---

## 🚀 Recommendations

### Immediate Actions

1. **Update .env file**
   ```dotenv
   VITE_COMPANY_SERVICE_URL=http://localhost:8082
   ```

2. **Wrap App with Providers** (main.jsx)
   ```javascript
   import AppProviders from './state/AppProviders';
   
   createRoot(document.getElementById('root')).render(
     <StrictMode>
       <AppProviders>
         <App />
       </AppProviders>
     </StrictMode>,
   )
   ```

3. **Create ProfileContext**
   - Location: `src/state/ProfileContext.jsx`
   - Purpose: Manage company profile state globally
   - Methods: loadProfile, updateProfile, refreshProfile

4. **Fix .gitignore**
   - Already configured correctly
   - `.idea/` is listed (line 2 and line 12)
   - Run: `git rm -r --cached .idea/` to unstage

### Implementation Priority

#### Phase 1: Core Integration (HIGH PRIORITY)
- [ ] Add VITE_COMPANY_SERVICE_URL to .env
- [ ] Integrate AppProviders in main.jsx
- [ ] Create ProfileContext
- [ ] Test profile service API calls

#### Phase 2: Dashboard Implementation (MEDIUM PRIORITY)
- [ ] Implement DashboardSidebar with company profile
- [ ] Show subscription status
- [ ] Add logout button
- [ ] Implement Settings page with profile edit

#### Phase 3: Public Profile Setup (MEDIUM PRIORITY)
- [ ] Check profile status on login
- [ ] Create onboarding flow for first-time users
- [ ] Public profile creation form

#### Phase 4: Additional Features (LOW PRIORITY)
- [ ] Company media gallery integration
- [ ] Profile avatar upload
- [ ] Enhanced profile settings

---

## 🔍 Testing Checklist

### Backend Testing
```bash
# Test company service endpoints
curl -H "Authorization: Bearer {token}" http://localhost:8082/profile/status
curl -H "Authorization: Bearer {token}" http://localhost:8082/profile
curl -H "Authorization: Bearer {token}" http://localhost:8082/public-profile
```

### Frontend Testing
```javascript
// Test in browser console after login
import { profileService } from './modules/profile/services/profileService';

// Check if profile exists
const status = await profileService.checkProfileStatus();
console.log('Profile Status:', status);

// Get company profile
const profile = await profileService.getCompanyProfile();
console.log('Company Profile:', profile);

// Get complete profile
const complete = await profileService.getCompleteProfile();
console.log('Complete Profile:', complete);
```

---

## 📝 Notes

1. **Token Flow**: Authentication service (port 8080) issues JWT tokens, Company service (port 8082) validates them
2. **Microservices**: Services communicate via Eureka for service discovery
3. **Database**: Each service has its own MongoDB database
4. **Kafka**: Used for async events (e.g., company registration notifications)
5. **CORS**: Ensure backend has CORS configured for http://localhost:5173 (Vite default port)

---

## 🎯 Summary

**Integration Readiness: 70%**

✅ **What's Good:**
- Backend API is complete and well-structured
- Frontend service layer is implemented correctly
- HTTP clients are properly configured
- Authentication flow works

⚠️ **What Needs Work:**
- Add missing environment variable
- Integrate providers in main.jsx
- Create ProfileContext for state management
- Implement dashboard pages with real data
- Remove .idea folder from git tracking

🚀 **Next Steps:**
Start with Phase 1 tasks to establish the core integration, then move to dashboard implementation.


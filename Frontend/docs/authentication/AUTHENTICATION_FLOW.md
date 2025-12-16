# 🔐 Authentication Flow Documentation

## Overview
The authentication system handles user login and registration, automatically redirecting to the dashboard upon successful authentication.

---

## 🔄 Authentication Flow

### Login Flow

```
User submits login form
    ↓
Validate credentials (mock: 1s delay)
    ↓
Store tokens in localStorage
    ├── accessToken: Used for API authentication
    └── refreshToken: Used to refresh access token
    ↓
Navigate to /dashboard
    ↓
ProtectedRoute checks for accessToken
    ↓
✅ User sees Dashboard
```

### Registration Flow

```
User completes registration (3 steps)
    ↓
Step 1: Basic Info (Company name, email, password)
Step 2: Contact Info (Phone, country)
Step 3: Address (City, street address)
    ↓
Submit registration
    ↓
Create account (mock: 1s delay)
    ↓
Auto-login: Store tokens in localStorage
    ├── accessToken
    └── refreshToken
    ↓
Navigate to /dashboard
    ↓
✅ User sees Dashboard (auto-logged in)
```

### Logout Flow

```
User clicks Logout button (in Sidebar)
    ↓
Clear tokens from localStorage
    ├── Remove accessToken
    └── Remove refreshToken
    ↓
Navigate to /login
    ↓
User sees login page
```

---

## 🔑 Token Storage

### Location
Tokens are stored in browser's `localStorage`:
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
```

### Access Token
- **Purpose**: Authenticate API requests
- **Usage**: Sent in Authorization header
- **Format**: `Bearer <token>`
- **Lifetime**: Typically 15-60 minutes (configured on backend)

### Refresh Token
- **Purpose**: Obtain new access token when expired
- **Usage**: Sent to refresh endpoint
- **Lifetime**: Typically 7-30 days (configured on backend)

---

## 🛡️ Protected Routes

### Implementation
All dashboard routes are wrapped with `ProtectedRoute` component:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  {/* Nested dashboard routes */}
</Route>
```

### How It Works

**ProtectedRoute.jsx**:
```javascript
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

**Behavior**:
- ✅ Has token → Render protected content
- ❌ No token → Redirect to `/login`

---

## 📝 Current Implementation (Mock)

### Login (useLogin.js)
```javascript
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 1000));

// Store mock tokens
const mockAccessToken = `access_token_${Date.now()}`;
const mockRefreshToken = `refresh_token_${Date.now()}`;

localStorage.setItem('accessToken', mockAccessToken);
localStorage.setItem('refreshToken', mockRefreshToken);

// Redirect to dashboard
navigate('/dashboard');
```

### Registration (useRegister.js)
```javascript
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 1000));

// Auto-login after registration
const mockAccessToken = `access_token_${Date.now()}`;
const mockRefreshToken = `refresh_token_${Date.now()}`;

localStorage.setItem('accessToken', mockAccessToken);
localStorage.setItem('refreshToken', mockRefreshToken);

// Redirect to dashboard
navigate('/dashboard');
```

### Logout (Sidebar.jsx)
```javascript
const handleLogout = () => {
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login
  navigate('/login');
};
```

---

## 🔄 Backend Integration Guide

### Step 1: Create Auth Service

**File: `src/services/api/authService.js`**

```javascript
import apiClient from './client';

export const authService = {
  // Login
  async login(email, password) {
    const response = await apiClient.post('/api/auth/login', { 
      email, 
      password 
    });
    
    // Store real tokens from backend
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  // Register
  async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData);
    
    // Auto-login: Store tokens
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  // Logout
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await apiClient.post('/api/auth/logout', { refreshToken });
    } finally {
      // Always clear tokens, even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/api/auth/refresh', { 
      refreshToken 
    });
    
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    
    return response;
  },
};
```

### Step 2: Update useLogin Hook

**Replace mock code with:**

```javascript
import { authService } from '../../services/api/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Call real backend API
    await authService.login(formData.email, formData.password);
    
    // Tokens are stored automatically in authService
    // Navigate to dashboard
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Update useRegister Hook

**Replace mock code with:**

```javascript
import { authService } from '../../services/api/authService';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (step < 3) {
    setStep(step + 1);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Validate password match
    if (formData.password !== formData.passwordConfirmation) {
      throw new Error('Passwords do not match');
    }

    // Call real backend API
    await authService.register({
      companyName: formData.companyName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      country: formData.country,
      city: formData.city,
      streetAddress: formData.streetAddress,
    });
    
    // Auto-login: Tokens stored in authService
    // Navigate to dashboard
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Update Sidebar Logout

**Replace with:**

```javascript
import { authService } from '../../services/api/authService';

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    navigate('/login');
  }
};
```

---

## 🔒 Security Best Practices

### ✅ Current Implementation
- Tokens stored in localStorage
- Protected routes check for token
- Logout clears all tokens
- Token-based authentication

### 🚀 Recommended Enhancements

#### 1. Token Expiration Check
```javascript
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

#### 2. Automatic Token Refresh
```javascript
// In API client interceptor
if (response.status === 401) {
  try {
    await authService.refreshToken();
    // Retry original request
    return apiClient.request(originalRequest);
  } catch {
    // Refresh failed, logout
    localStorage.clear();
    window.location.href = '/login';
  }
}
```

#### 3. HTTP-Only Cookies (Backend Required)
- Store tokens in HTTP-only cookies instead of localStorage
- More secure against XSS attacks
- Requires backend CORS configuration

#### 4. CSRF Protection
- Implement CSRF tokens for state-changing requests
- Backend generates CSRF token
- Frontend includes in headers

---

## 🧪 Testing Authentication

### Manual Test - Login Flow

1. **Go to login page**
   ```
   http://localhost:5173/login
   ```

2. **Enter any credentials** (mock accepts any)
   - Email: test@example.com
   - Password: password123

3. **Click "Continue"**
   - See loading state
   - Wait 1 second (mock delay)

4. **Verify redirect**
   - Should navigate to `/dashboard`
   - Should see dashboard content

5. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - Should see `accessToken` and `refreshToken`

### Manual Test - Registration Flow

1. **Go to register page**
   ```
   http://localhost:5173/register
   ```

2. **Complete all 3 steps**
   - Step 1: Company info
   - Step 2: Contact info
   - Step 3: Address

3. **Submit final step**
   - See loading state
   - Wait 1 second

4. **Verify auto-login & redirect**
   - Should navigate to `/dashboard`
   - Should see dashboard (logged in)

### Manual Test - Logout Flow

1. **While on dashboard**
   - Look at sidebar bottom
   - Click "LOGOUT" button

2. **Verify logout**
   - Should redirect to `/login`
   - Check localStorage (tokens cleared)

3. **Try accessing dashboard**
   ```
   http://localhost:5173/dashboard
   ```
   - Should redirect back to `/login`

### Manual Test - Protected Route

1. **Clear tokens**
   ```javascript
   localStorage.clear();
   ```

2. **Try accessing dashboard**
   ```
   http://localhost:5173/dashboard
   ```
   - Should redirect to `/login` immediately

3. **Login again**
   - Should be able to access dashboard

---

## 🐛 Troubleshooting

### Issue: Redirects to login immediately after login
**Cause**: Token not being stored correctly  
**Solution**: Check browser console for errors, verify localStorage has tokens

### Issue: Dashboard not accessible after login
**Cause**: ProtectedRoute not finding token  
**Solution**: 
```javascript
// Check in browser console
console.log(localStorage.getItem('accessToken'));
```

### Issue: Logout doesn't work
**Cause**: Tokens not being cleared  
**Solution**: Clear localStorage manually and reload

### Issue: Infinite redirect loop
**Cause**: ProtectedRoute logic error  
**Solution**: Check ProtectedRoute implementation, ensure proper token check

---

## 📊 Authentication State Diagram

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│    Login    │   │  Register   │
│    Page     │   │    Page     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │   Submit Form   │
       ├─────────────────┤
       │                 │
       ▼                 ▼
┌──────────────────────────┐
│   Store Tokens (Auth)    │
│ • accessToken            │
│ • refreshToken           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    Navigate to           │
│     /dashboard           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│  ProtectedRoute Check    │
│  Has accessToken?        │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌─────┐  ┌────────┐
│Show │  │Redirect│
│Dash-│  │  to    │
│board│  │ /login │
└──┬──┘  └────────┘
   │
   │ Click Logout
   ▼
┌──────────────┐
│ Clear Tokens │
│ Navigate to  │
│   /login     │
└──────────────┘
```

---

## ✅ Summary

**Current State:**
- ✅ Login redirects to `/dashboard`
- ✅ Registration auto-logs in and redirects to `/dashboard`
- ✅ Logout clears tokens and redirects to `/login`
- ✅ Protected routes check for authentication
- ✅ Mock tokens working correctly

**Next Steps for Production:**
1. Replace mock delays with actual API calls
2. Implement authService with backend endpoints
3. Add token expiration handling
4. Add automatic token refresh
5. Implement proper error handling
6. Add loading skeletons
7. Add success/error toast notifications

---

**Last Updated**: December 15, 2025  
**Status**: ✅ Authentication flow complete with dashboard redirect  


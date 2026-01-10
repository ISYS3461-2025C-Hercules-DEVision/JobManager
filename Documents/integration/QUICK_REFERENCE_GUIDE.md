# Company Service Integration - Quick Reference Guide

## 📋 Quick Overview

This document provides a quick reference for the company service integration between backend and frontend.

---

## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:8082
```

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile/status` | Check if public profile exists | ✅ Yes |
| GET | `/profile` | Get company profile | ✅ Yes |
| PUT | `/profile` | Update company profile | ✅ Yes |
| POST | `/public-profile` | Create public profile (first-time) | ✅ Yes |
| GET | `/public-profile` | Get public profile | ✅ Yes |
| PUT | `/public-profile` | Update public profile | ✅ Yes |

---

## 💻 Frontend Usage Examples

### 1. Using ProfileContext in Components

```javascript
import { useProfile } from '../../../state';

function MyComponent() {
  const { profile, publicProfile, loading, updateProfile } = useProfile();
  
  // Display company name
  const companyName = profile?.companyName || 'Loading...';
  
  // Check subscription status
  const isPremium = profile?.isPremium;
  
  // Update profile
  const handleUpdate = async () => {
    const result = await updateProfile({
      phoneNumber: '+1234567890',
      city: 'New York'
    });
    
    if (result.success) {
      console.log('Profile updated!');
    }
  };
  
  return (
    <div>
      <h1>{companyName}</h1>
      {isPremium && <span>Premium Member</span>}
    </div>
  );
}
```

### 2. Checking Profile Status

```javascript
import { useProfile } from '../../../state';
import { useEffect } from 'react';

function DashboardGuard() {
  const { hasPublicProfile, checkProfileStatus } = useProfile();
  
  useEffect(() => {
    const checkStatus = async () => {
      const hasProfile = await checkProfileStatus();
      
      if (!hasProfile) {
        // Redirect to onboarding
        navigate('/onboarding');
      }
    };
    
    checkStatus();
  }, []);
  
  return hasPublicProfile ? <Dashboard /> : <Loading />;
}
```

### 3. Creating Public Profile

```javascript
import { useProfile } from '../../../state';

function OnboardingPage() {
  const { createPublicProfile, loading } = useProfile();
  
  const handleSubmit = async (formData) => {
    const result = await createPublicProfile({
      companyName: formData.name,
      logoUrl: formData.logo,
      bannerUrl: formData.banner
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
  };
  
  return <OnboardingForm onSubmit={handleSubmit} loading={loading} />;
}
```

---

## 🎨 Available Data Structures

### Profile Object
```javascript
{
  companyId: "string",
  companyName: "string",
  email: "string",
  phoneNumber: "string",
  streetAddress: "string",
  city: "string",
  country: "string",
  isEmailVerified: boolean,
  isActive: boolean,
  isPremium: boolean,
  ssoProvider: "LOCAL" | "GOOGLE",
  createdAt: "datetime",
  updatedAt: "datetime",
  hasPublicProfile: boolean
}
```

### Public Profile Object
```javascript
{
  companyId: "string",
  displayName: "string",
  aboutUs: "string (max 2000 chars)",
  whoWeAreLookingFor: "string (max 1000 chars)",
  websiteUrl: "string (URL)",
  industryDomain: "string (max 100 chars)",
  logoUrl: "string (URL)",
  bannerUrl: "string (URL)",
  country: "string",
  city: "string",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

---

## 🔐 Authentication Flow

### How JWT Token Works

1. **Login** → `AuthContext.login()` → Token saved to localStorage
2. **API Call** → `companyHttpClient` intercepts request → Adds `Authorization: Bearer {token}` header
3. **Backend** → Validates token → Extracts user email → Returns company data
4. **Logout** → `AuthContext.logout()` → Token removed → Redirect to login

### Token Storage

```javascript
// Token is stored in localStorage with key:
'accessToken'

// Access token helpers (already implemented):
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';
```

---

## 🎯 Common Use Cases

### 1. Display Company Name in Navbar
```javascript
import { useProfile } from '../state';

function Navbar() {
  const { profile, publicProfile } = useProfile();
  const name = publicProfile?.displayName || profile?.companyName;
  
  return <nav>{name}</nav>;
}
```

### 2. Show Subscription Badge
```javascript
import { useProfile } from '../state';

function SubscriptionBadge() {
  const { profile } = useProfile();
  
  return (
    <span className={profile?.isPremium ? 'badge-premium' : 'badge-free'}>
      {profile?.isPremium ? 'Premium' : 'Free'}
    </span>
  );
}
```

### 3. Profile Settings Form
```javascript
import { useProfile } from '../state';
import { useApp } from '../state';

function ProfileForm() {
  const { profile, updateProfile, loading } = useProfile();
  const { showSuccess, showError } = useApp();
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName,
        phoneNumber: profile.phoneNumber,
        city: profile.city
      });
    }
  }, [profile]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    
    if (result.success) {
      showSuccess('Profile updated successfully');
    } else {
      showError(result.error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🐛 Troubleshooting

### Issue: "Profile data is null"
**Solution**: Ensure user is authenticated and ProfileContext is mounted
```javascript
const { profile, loading } = useProfile();

if (loading) return <Loading />;
if (!profile) return <Error message="Profile not found" />;
```

### Issue: "Token not being sent to API"
**Solution**: Check if token exists in localStorage
```javascript
import { getToken } from '../utils/tokenStorage';
console.log('Token:', getToken());
```

### Issue: "401 Unauthorized error"
**Solution**: Token might be expired or invalid
- Check if login was successful
- Verify backend is running on port 8082
- Check if token is being added to headers (Network tab → Headers)

### Issue: "Cannot read property of undefined"
**Solution**: Always use optional chaining
```javascript
// ❌ Bad
const name = profile.companyName;

// ✅ Good
const name = profile?.companyName || 'Default Name';
```

---

## 📱 Notifications System

### Available Notification Methods
```javascript
import { useApp } from '../state';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useApp();
  
  // Success notification (3 seconds)
  showSuccess('Operation completed!');
  
  // Error notification (5 seconds)
  showError('Something went wrong');
  
  // Info notification (4 seconds)
  showInfo('Please note...');
  
  // Warning notification (4 seconds)
  showWarning('Be careful!');
  
  // Custom duration
  showSuccess('Custom message', 2000); // 2 seconds
}
```

---

## 🔄 Refresh Profile Data

```javascript
import { useProfile } from '../state';

function RefreshButton() {
  const { refreshProfile, loading } = useProfile();
  
  return (
    <button onClick={refreshProfile} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh Profile'}
    </button>
  );
}
```

---

## 📦 Import Shortcuts

```javascript
// Instead of:
import { useProfile } from '../../../state/ProfileContext';
import { useAuth } from '../../../state/AuthContext';
import { useApp } from '../../../state/AppContext';

// Use:
import { useProfile, useAuth, useApp } from '../../../state';
// or
import { useProfile, useAuth, useApp } from '../state'; // if at root
```

---

## 🚀 Performance Tips

1. **Avoid unnecessary re-renders**
   ```javascript
   // Only destructure what you need
   const { profile } = useProfile(); // ✅ Good
   const profileContext = useProfile(); // ❌ Re-renders on any change
   ```

2. **Use loading states**
   ```javascript
   const { profile, loading } = useProfile();
   if (loading) return <Skeleton />;
   ```

3. **Cache profile data**
   - ProfileContext automatically caches data
   - No need to refetch on every component mount

---

## 📝 Validation Rules

### Company Profile
- **companyName**: Required, 2-100 characters
- **email**: Required, valid email format
- **phoneNumber**: Optional, valid phone format
- **city**: Optional, max 100 characters
- **country**: Optional, max 100 characters
- **streetAddress**: Optional, max 255 characters

### Public Profile
- **displayName**: 2-100 characters
- **aboutUs**: Max 2000 characters
- **whoWeAreLookingFor**: Max 1000 characters
- **websiteUrl**: Valid HTTP/HTTPS URL
- **industryDomain**: Max 100 characters
- **logoUrl**: Valid HTTP/HTTPS URL
- **bannerUrl**: Valid HTTP/HTTPS URL

---

## 🎓 Best Practices

1. **Always check loading state**
   ```javascript
   if (loading) return <Loading />;
   ```

2. **Handle errors gracefully**
   ```javascript
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Use optional chaining**
   ```javascript
   const name = profile?.companyName ?? 'Unknown';
   ```

4. **Show user feedback**
   ```javascript
   const result = await updateProfile(data);
   if (result.success) showSuccess('Updated!');
   else showError(result.error);
   ```

5. **Validate before submission**
   ```javascript
   if (!formData.companyName) {
     showError('Company name is required');
     return;
   }
   ```

---

## 🔗 Related Files

- **ProfileContext**: `src/state/ProfileContext.jsx`
- **Profile Service**: `src/modules/profile/services/profileService.js`
- **Company HTTP Client**: `src/utils/companyHttpClient.js`
- **Settings Page**: `src/modules/dashboard/ui/SettingsPage.jsx`
- **Sidebar**: `src/modules/dashboard/ui/Sidebar.jsx`

---

**Need help? Check the full integration documentation in:**
`Documents/integration/BACKEND_FRONTEND_INTEGRATION_ANALYSIS.md`


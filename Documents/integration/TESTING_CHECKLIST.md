# ✅ Integration Checklist - Ready to Test

## Pre-Flight Checks

### ✅ Backend Services
- [ ] MongoDB running on port 27017 (authentication)
- [ ] MongoDB running on port 27018 (company)
- [ ] Kafka running on port 29092
- [ ] Eureka Discovery running on port 8761
- [ ] Authentication Service running on port 8080
- [ ] Company Service running on port 8082

### ✅ Frontend Setup
- [x] All npm dependencies installed
- [x] Environment variables configured
- [x] ProfileContext created
- [x] AppProviders integrated
- [x] Sidebar updated
- [x] Settings page updated
- [x] No compilation errors

---

## 🧪 Testing Workflow

### Step 1: Start Backend Services

```bash
# Terminal 1 - Start Eureka Discovery (if not using Docker)
cd "D:\JobManager - DEVision\Backend\discovery"
./gradlew bootRun

# Terminal 2 - Start Authentication Service
cd "D:\JobManager - DEVision\Backend\authentication"
./gradlew bootRun

# Terminal 3 - Start Company Service
cd "D:\JobManager - DEVision\Backend\company"
./gradlew bootRun
```

Wait for all services to start (check console for "Started" messages).

### Step 2: Start Frontend

```bash
# Terminal 4 - Start Vite Dev Server
cd "D:\JobManager - DEVision\Frontend"
npm run dev
```

Should start on: http://localhost:5173

### Step 3: Test User Registration

1. Navigate to http://localhost:5173/register
2. Fill in registration form:
   - Company Name: "Test Company"
   - Email: "test@example.com"
   - Password: "TestPass123!"
   - Phone: "+1234567890"
   - Country: "United States"
   - City: "New York"
   - Address: "123 Main St"
3. Click Register
4. Should receive OTP code via email
5. Verify email with OTP

**Expected Result**: ✅ Registration successful, redirected to verify page

### Step 4: Test Login

1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "TestPass123!"
3. Click Login

**Expected Result**: ✅ Login successful, redirected to /dashboard

### Step 5: Verify Sidebar Integration

**Check in Sidebar (left side):**
- [ ] Company name displays: "Test Company"
- [ ] Subscription shows: "Free" (with gray dot)
- [ ] Status shows: "Active" (with green indicator)
- [ ] Logo shows: First letter "T" (no logo uploaded yet)
- [ ] Logout button is visible

**Expected Result**: ✅ All company data loads from backend

### Step 6: Test Settings Page - Company Profile

1. Click on "Settings" in sidebar
2. Should see "Company Profile" tab active
3. Verify data loaded:
   - [ ] Company Name: "Test Company"
   - [ ] Email: "test@example.com"
   - [ ] Phone Number: "+1234567890"
   - [ ] Country: "United States"
   - [ ] City: "New York"
   - [ ] Street Address: "123 Main St"
4. Change City to "Los Angeles"
5. Click "Save Changes"

**Expected Result**: 
- ✅ "Company profile updated successfully" notification appears
- ✅ Data persists after page refresh

### Step 7: Test Settings Page - Public Profile

1. Scroll down to "Public Profile" section
2. Fill in fields:
   - Display Name: "Tech Innovators Inc"
   - Industry Domain: "Information Technology"
   - Website URL: "https://techinnovators.com"
   - About Us: "We are a leading tech company..."
   - Who We Are Looking For: "Passionate developers..."
   - Logo URL: "https://via.placeholder.com/150"
   - Banner URL: "https://via.placeholder.com/1200x300"
3. Click "Save Public Profile"

**Expected Result**:
- ✅ "Public profile updated successfully" notification appears
- ✅ Character counter updates as you type
- ✅ Data persists after page refresh

### Step 8: Verify Sidebar Updates

After saving public profile:
- [ ] Company name in sidebar changes to "Tech Innovators Inc"
- [ ] Logo displays (from Logo URL)

**Expected Result**: ✅ Sidebar reflects public profile data

### Step 9: Test Logout

1. Click "Logout" button in sidebar
2. Should see "Logged out successfully" notification
3. Should redirect to login page

**Expected Result**: ✅ Logout successful, token cleared

### Step 10: Verify Data Persistence

1. Login again with same credentials
2. Navigate to Settings
3. Check if data is still there

**Expected Result**: ✅ All previously saved data loads correctly

---

## 🔍 Network Monitoring

### Open Browser DevTools (F12) → Network Tab

**On Login:**
- ✅ POST `http://localhost:8080/login` → 200 OK

**On Dashboard Load:**
- ✅ GET `http://localhost:8082/profile/status` → 200 OK
- ✅ GET `http://localhost:8082/profile` → 200 OK
- ✅ GET `http://localhost:8082/public-profile` → 200 OK (or 404 if not created)

**On Save Company Profile:**
- ✅ PUT `http://localhost:8082/profile` → 200 OK

**On Save Public Profile:**
- ✅ PUT `http://localhost:8082/public-profile` → 200 OK

**On Logout:**
- ✅ Token removed from localStorage
- ✅ Profile state cleared

---

## 🐛 Troubleshooting Guide

### Problem: "Cannot connect to backend"
**Solution:**
```bash
# Check if services are running
netstat -an | findstr "8080"  # Auth service
netstat -an | findstr "8082"  # Company service
```

### Problem: "401 Unauthorized"
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Login again
- Check Network tab → Request Headers → Authorization should have Bearer token

### Problem: "Profile data not loading"
**Solution:**
- Check browser console for errors
- Verify `VITE_COMPANY_SERVICE_URL` in .env file
- Restart frontend dev server after .env changes

### Problem: "CORS error"
**Solution:**
- Backend needs to allow `http://localhost:5173`
- Check backend CORS configuration
- Restart backend services

### Problem: "Notifications not showing"
**Solution:**
- Verify AppProviders is wrapping App component in main.jsx
- Check if useApp hook is imported correctly
- Look for console errors

---

## 📊 Success Criteria

### All These Should Work:
- [x] ✅ Frontend compiles without errors
- [ ] ✅ Login redirects to dashboard
- [ ] ✅ Sidebar shows company data
- [ ] ✅ Settings loads profile data
- [ ] ✅ Profile updates save to backend
- [ ] ✅ Public profile updates save to backend
- [ ] ✅ Logout clears data and redirects
- [ ] ✅ Data persists across sessions
- [ ] ✅ Notifications display correctly
- [ ] ✅ Loading states show during API calls

---

## 🎯 Final Verification

Run this in browser console after login:
```javascript
// Check if ProfileContext is working
window.testProfile = async () => {
  const token = localStorage.getItem('accessToken');
  console.log('Token exists:', !!token);
  
  const response = await fetch('http://localhost:8082/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  console.log('Profile data:', data);
};

window.testProfile();
```

**Expected Output:**
```
Token exists: true
Profile data: { companyId: "...", companyName: "Test Company", ... }
```

---

## 📝 Post-Testing Notes

After successful testing, document:
- [ ] Any errors encountered
- [ ] Performance observations
- [ ] UI/UX improvements needed
- [ ] Additional features to implement

---

## 🚀 Ready to Deploy?

Before deploying to production:
1. Update environment variables for production URLs
2. Test with production databases
3. Enable HTTPS
4. Set up proper error logging
5. Configure CORS for production domain
6. Test with multiple concurrent users
7. Verify data persistence
8. Check security (JWT expiration, token refresh)

---

**Status: Ready for Testing! 🎉**

All integration work is complete. Follow this checklist to verify everything works correctly.


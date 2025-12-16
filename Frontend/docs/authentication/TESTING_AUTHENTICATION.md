# 🚀 Quick Start - Testing Authentication Integration

## Prerequisites
- ✅ Docker Desktop running
- ✅ Java 21 installed
- ✅ Node.js installed
- ✅ Backend services ready

---

## Step 1: Start Backend Services

### 1.1 Start Docker Services
```powershell
cd "D:\JobManager - DEVision\Backend"
docker-compose up -d
```

**Services Started:**
- MongoDB (Authentication): Port 27017
- MongoDB (Company): Port 27018
- MongoDB (Job): Port 27019
- Redis: Port 6379
- Kafka: Port 29092
- Zookeeper: Port 22181
- Kong Gateway: Ports 8000, 8001, 8002

### 1.2 Verify Docker Services
```powershell
docker ps
```
You should see all containers running.

### 1.3 Start Authentication Service
```powershell
cd "D:\JobManager - DEVision\Backend\authentication"
.\gradlew.bat bootRun
```

**Authentication Service:** `http://localhost:8080`

Wait for the message: "Started AuthenticationApplication"

---

## Step 2: Start Frontend

### 2.1 Install Dependencies (First Time Only)
```powershell
cd "D:\JobManager - DEVision\Frontend"
npm install
```

### 2.2 Start Development Server
```powershell
npm run dev
```

**Frontend:** `http://localhost:5173`

---

## Step 3: Test Registration

### 3.1 Open Browser
Navigate to: `http://localhost:5173/register`

### 3.2 Fill Registration Form
**Step 1 - Basic Info:**
- Company Name: `Test Company`
- Email: `test@example.com`
- Password: `Test@123456` (must be strong)
- Confirm Password: `Test@123456`
- Phone: `+84123456789`
- Country: Select `VN` (Vietnam)
- City: Select `hanoi`
- Address: Select any address

### 3.3 Submit
Click "Create Profile" → Should show success message and redirect to login

### 3.4 Check Email
- Open your email inbox for `test@example.com`
- Find verification code (6 digits)
- Copy the OTP code

---

## Step 4: Verify Email

### 4.1 Using Postman/Insomnia
```http
POST http://localhost:8080/verify-email
Content-Type: application/json

{
  "userName": "test@example.com",
  "code": "123456"
}
```

Response: `"Email verified"`

---

## Step 5: Test Login

### 5.1 Navigate to Login
Go to: `http://localhost:5173/login`

### 5.2 Enter Credentials
- Email: `test@example.com`
- Password: `Test@123456`

### 5.3 Submit
Click "Continue"

### 5.4 Verify Success
- Should redirect to `/dashboard`
- Check browser console for success logs
- Check localStorage for `accessToken`

---

## 🔍 Debugging Tips

### Check Backend Logs
Look in the terminal where `gradlew bootRun` is running:
```
>>> LOGIN username = test@example.com
>>> LOGIN password = Test@123456
```

### Check Frontend Console
Open browser DevTools (F12) → Console:
```
🚀 API Request: POST /login
✅ Login successful: { token: "eyJ..." }
```

### Check Network Tab
DevTools → Network → Filter by "Fetch/XHR":
- See all API requests
- Check request/response data
- Verify status codes (200 = success)

### Check localStorage
DevTools → Application → Local Storage → http://localhost:5173:
- `accessToken`: Should contain JWT token

---

## ⚠️ Common Issues

### Issue: "User not found"
**Solution**: Make sure you verified your email after registration

### Issue: "Invalid credentials"
**Solution**: 
- Check password is correct
- Make sure email is verified

### Issue: "Connection refused"
**Solution**: 
- Backend not running → Start with `gradlew bootRun`
- Docker not running → Start with `docker-compose up -d`

### Issue: "Email already exists"
**Solution**: Use a different email or delete the user from MongoDB

### Issue: CORS error
**Solution**: Backend needs CORS configuration for localhost:5173

---

## 📊 API Testing with Postman

### Test Login
```http
POST http://localhost:8080/login
Content-Type: application/json

{
  "username": "test@example.com",
  "password": "Test@123456"
}
```

Expected Response: JWT token (string)

### Test Registration
```http
POST http://localhost:8080/register
Content-Type: application/json

{
  "companyName": "Test Company",
  "email": "test@example.com",
  "password": "Test@123456",
  "phoneNumber": "+84123456789",
  "country": "VN",
  "city": "hanoi",
  "address": "123 Main St"
}
```

Expected Response: `200 OK`

---

## ✅ Success Checklist

- [ ] Docker services running
- [ ] Backend authentication service running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Receive verification email
- [ ] Can verify email with OTP
- [ ] Can login with verified account
- [ ] Token stored in localStorage
- [ ] Redirected to dashboard after login

---

## 🎯 Next Steps After Integration Works

1. **Dashboard Implementation**: Create actual dashboard UI
2. **Protected Routes**: Implement route guards
3. **Token Refresh**: Add automatic token refresh
4. **User Profile**: Show user info in dashboard
5. **Company Service**: Integrate company endpoints
6. **Job Service**: Integrate job posting endpoints
7. **Error Handling**: Improve error messages
8. **Loading States**: Better loading indicators
9. **Form Validation**: Client-side validation
10. **Testing**: Write unit and E2E tests

---

**Ready to test?** Follow the steps above! 🚀


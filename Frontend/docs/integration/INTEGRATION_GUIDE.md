# 🔗 Frontend-Backend Integration Guide

## Overview
This guide explains how the frontend is integrated with the backend authentication service.

---

## 🏗️ Architecture

### Backend Services
- **Authentication Service**: `http://localhost:8080`
- **Company Service**: `http://localhost:8081` (future)
- **Job Service**: `http://localhost:8082` (future)

### Frontend
- **Development Server**: `http://localhost:5173`
- **Vite Dev Server** with proxy configuration

---

## 🔐 Authentication Flow

### 1. Login Flow
```
User submits login form
    ↓
POST /login
    Body: { username: email, password }
    ↓
Backend validates credentials
    ↓
Returns JWT token (plain string)
    ↓
Frontend stores token in localStorage
    ↓
Navigate to /dashboard
```

### 2. Registration Flow
```
User completes registration (3 steps)
    ↓
POST /register
    Body: {
        companyName, email, password,
        phoneNumber, country, city, address
    }
    ↓
Backend creates user & sends verification email
    ↓
Returns 200 OK
    ↓
Frontend shows success message
    ↓
Navigate to /login
    ↓
User verifies email via OTP
    ↓
User can now login
```

### 3. Email Verification Flow
```
User receives email with OTP code
    ↓
POST /verify-email
    Body: { userName: email, code: "123456" }
    ↓
Backend verifies OTP
    ↓
User account is verified
    ↓
User can now login
```

---

## 📁 File Structure

### Configuration Files
```
Frontend/
├── .env                        # Environment variables
├── .env.example                # Example environment variables
├── src/
│   ├── config/
│   │   ├── env.js             # Environment configuration
│   │   └── api.js             # API endpoints configuration
│   ├── utils/
│   │   ├── HttpUtil.js        # Axios HTTP client
│   │   └── tokenStorage.js   # Token storage utilities
│   └── modules/
│       └── auth/
│           ├── services/
│           │   └── authService.js  # Authentication API service
│           ├── hooks/
│           │   ├── useLogin.js     # Login hook
│           │   └── useRegister.js  # Registration hook
│           └── ui/
│               ├── LoginPage.jsx
│               └── RegisterPage.jsx
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVICE_URL=http://localhost:8080

# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=false

# App Configuration
VITE_APP_VERSION=1.0.0
```

### Vite Config (vite.config.js)
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

---

## 🌐 API Endpoints

### Authentication Service (Port 8080)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/login` | POST | User login | `{ username, password }` | JWT token (string) |
| `/register` | POST | User registration | `{ companyName, email, password, phoneNumber, country, city, address }` | 200 OK |
| `/verify-email` | POST | Verify email with OTP | `{ userName, code }` | "Email verified" |
| `/resend-verification` | POST | Resend OTP | Query param: `?email=...` | 200 OK |
| `/google` | POST | Google OAuth login | `{ code }` | JWT token (string) |

---

## 🔑 Token Management

### Storage
- **Location**: `localStorage`
- **Key**: `accessToken`
- **Format**: JWT token (string)

### Usage
```javascript
// Save token
localStorage.setItem('accessToken', token);

// Get token
const token = localStorage.getItem('accessToken');

// Remove token (logout)
localStorage.removeItem('accessToken');
```

### HTTP Interceptor
All API requests automatically include the token:
```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

---

## 🚀 Getting Started

### 1. Start Backend Services

```bash
# Navigate to backend
cd Backend

# Start Docker services (MongoDB, Redis, Kafka)
docker-compose up -d

# Start Authentication service
cd authentication
./gradlew bootRun
```

Backend will run on `http://localhost:8080`

### 2. Start Frontend

```bash
# Navigate to frontend
cd Frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🧪 Testing the Integration

### 1. Test Registration
1. Navigate to `http://localhost:5173/register`
2. Fill in all registration fields:
   - Company Name: "Test Company"
   - Email: "test@example.com"
   - Password: Strong password (with special chars)
   - Phone: "+84123456789"
   - Country: Select from dropdown
   - City: Select from dropdown
   - Address: Select from dropdown
3. Submit the form
4. Check console for API call logs
5. Check email for verification OTP

### 2. Test Email Verification
1. Get OTP from email
2. Call `/verify-email` endpoint (can use Postman)
3. Body: `{ "userName": "test@example.com", "code": "123456" }`

### 3. Test Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: "test@example.com"
   - Password: Your password
3. Submit the form
4. Should redirect to `/dashboard`
5. Check localStorage for `accessToken`

---

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Ensure backend has CORS configuration for `http://localhost:5173`

### Issue: Connection Refused
**Solution**: 
- Check backend is running on port 8080
- Check Docker services are running
- Verify `.env` has correct API URL

### Issue: 401 Unauthorized
**Solution**: 
- Token might be expired
- Check token is being sent in Authorization header
- Clear localStorage and login again

### Issue: Registration fails with validation error
**Solution**:
- Check password meets requirements (strong password)
- Phone number format: "+84XXXXXXXXXX"
- All required fields are filled

---

## 📝 API Request/Response Examples

### Login Request
```javascript
POST http://localhost:8080/login
Content-Type: application/json

{
  "username": "test@example.com",
  "password": "StrongPass123!"
}
```

### Login Response
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Registration Request
```javascript
POST http://localhost:8080/register
Content-Type: application/json

{
  "companyName": "Test Company",
  "email": "test@example.com",
  "password": "StrongPass123!",
  "phoneNumber": "+84123456789",
  "country": "VN",
  "city": "hanoi",
  "address": "123 Main Street"
}
```

### Registration Response
```
200 OK
```

---

## 🔐 Security Notes

1. **JWT Token**: Stored in localStorage (consider httpOnly cookies for production)
2. **Password**: Must meet strong password requirements
3. **HTTPS**: Use HTTPS in production
4. **Token Expiration**: Implement token refresh mechanism
5. **Email Verification**: Required before login

---

## 📚 Next Steps

1. ✅ Implement email verification UI page
2. ✅ Add Google OAuth integration
3. ✅ Implement password reset flow
4. ✅ Add token refresh mechanism
5. ✅ Integrate Company service
6. ✅ Integrate Job service
7. ✅ Add error boundary components
8. ✅ Implement loading states
9. ✅ Add unit tests
10. ✅ Add E2E tests

---

## 💡 Tips

- **Development**: Use browser DevTools Network tab to monitor API calls
- **Debugging**: Check console logs for request/response data
- **Testing**: Use Postman/Insomnia to test backend endpoints directly
- **Logs**: Backend logs show incoming requests and responses

---

## 📞 Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Review this integration guide
4. Contact team members

---

**Last Updated**: 2025-12-16
**Version**: 1.0.0


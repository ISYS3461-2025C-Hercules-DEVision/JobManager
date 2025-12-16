# 🚀 Quick Reference - Frontend-Backend Integration

## 🎯 Quick Start Commands

### Backend
```powershell
# Start Docker
cd "D:\JobManager - DEVision\Backend"
docker-compose up -d

# Start Authentication Service
cd authentication
.\gradlew.bat bootRun
```
**Backend URL**: http://localhost:8080

### Frontend
```powershell
# Start Frontend
cd "D:\JobManager - DEVision\Frontend"
npm run dev
```
**Frontend URL**: http://localhost:5173

---

## 📡 API Endpoints

| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/login` | POST | Login | `{ username, password }` |
| `/register` | POST | Register | `{ companyName, email, password, phoneNumber, country, city, address }` |
| `/verify-email` | POST | Verify | `{ userName, code }` |
| `/resend-verification` | POST | Resend OTP | Query: `?email=...` |
| `/google` | POST | OAuth | `{ code }` |

---

## 🔑 Important Files

### Configuration
- `Frontend/.env` - Environment variables
- `Frontend/src/config/env.js` - Env config
- `Frontend/src/config/api.js` - API endpoints

### Core Services
- `Frontend/src/utils/HttpUtil.js` - HTTP client
- `Frontend/src/utils/tokenStorage.js` - Token management
- `Frontend/src/modules/auth/services/authService.js` - Auth API

### Hooks
- `Frontend/src/modules/auth/hooks/useLogin.js` - Login logic
- `Frontend/src/modules/auth/hooks/useRegister.js` - Register logic

---

## 🧪 Test Credentials Example

```javascript
// Registration
{
  "companyName": "Test Company",
  "email": "test@example.com",
  "password": "Test@123456",
  "phoneNumber": "+84123456789",
  "country": "VN",
  "city": "hanoi",
  "address": "123 Main St"
}

// Login
{
  "username": "test@example.com",
  "password": "Test@123456"
}
```

---

## 🐛 Quick Debug

### Check Backend
```powershell
curl http://localhost:8080/login -X POST -H "Content-Type: application/json" -d '{"username":"test@example.com","password":"Test@123456"}'
```

### Check Frontend
1. Open DevTools (F12)
2. Go to Console tab
3. Look for `🚀 API Request` logs
4. Check Application → Local Storage → `accessToken`

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `INTEGRATION_GUIDE.md` | Complete integration guide |
| `TESTING_AUTHENTICATION.md` | Testing steps |
| `INTEGRATION_COMPLETE.md` | Changes summary |
| `INTEGRATION_CHECKLIST.md` | Verification checklist |

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check backend CORS config |
| Connection refused | Start backend service |
| User not found | Verify email first |
| Token not saved | Check localStorage enabled |

---

## ✅ Status: READY TO TEST

All integration work is complete! 🎉


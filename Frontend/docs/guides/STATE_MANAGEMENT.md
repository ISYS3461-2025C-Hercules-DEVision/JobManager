# 🎯 State Management Documentation

## Overview

The Job Manager frontend uses **React Context API** for state management. This provides a simple, built-in solution without additional dependencies.

---

## 📁 Structure

```
src/state/
├── AuthContext.jsx      # Authentication state & methods
├── AppContext.jsx       # Application-wide state
├── AppProviders.jsx     # Combined providers wrapper
├── index.js            # Central exports
└── store.js            # Legacy compatibility
```

---

## 🔐 AuthContext

### Purpose
Manages user authentication state and provides authentication methods.

### State
- `user` - Current user object (null if not authenticated)
- `loading` - Loading state during auth check
- `isAuthenticated` - Boolean authentication status

### Methods

#### `login(credentials)`
Login user with email and password
```javascript
const { login } = useAuth();

const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  // Login successful
  navigate('/dashboard');
} else {
  // Show error
  console.error(result.error);
}
```

#### `register(userData)`
Register new user/company
```javascript
const { register } = useAuth();

const result = await register({
  companyName: 'My Company',
  email: 'user@example.com',
  password: 'password123',
  phoneNumber: '+84123456789',
  country: 'VN',
  city: 'hanoi',
  address: '123 Main St'
});
```

#### `logout()`
Logout current user
```javascript
const { logout } = useAuth();

await logout();
navigate('/login');
```

#### `verifyEmail(email, code)`
Verify email with OTP code
```javascript
const { verifyEmail } = useAuth();

const result = await verifyEmail('user@example.com', '123456');
```

#### `resendVerification(email)`
Resend verification code
```javascript
const { resendVerification } = useAuth();

await resendVerification('user@example.com');
```

#### `updateUser(userData)`
Update user profile in state
```javascript
const { updateUser } = useAuth();

updateUser({ name: 'New Name' });
```

#### `checkAuth()`
Re-check authentication status
```javascript
const { checkAuth } = useAuth();

await checkAuth();
```

---

## 🎨 AppContext

### Purpose
Manages application-wide UI state and notifications.

### State
- `sidebarOpen` - Sidebar visibility (boolean)
- `theme` - Current theme ('light' or 'dark')
- `notifications` - Array of notification objects
- `globalLoading` - Global loading state

### Methods

#### Sidebar Management
```javascript
const { sidebarOpen, toggleSidebar, setSidebarOpen } = useApp();

// Toggle sidebar
toggleSidebar();

// Set explicitly
setSidebarOpen(true);
```

#### Theme Management
```javascript
const { theme, toggleTheme, setTheme } = useApp();

// Toggle between light/dark
toggleTheme();

// Set explicitly
setTheme('dark');
```

#### Notifications
```javascript
const { showSuccess, showError, showInfo, showWarning } = useApp();

// Show success message (3s duration)
showSuccess('Profile updated successfully!');

// Show error message (5s duration)
showError('Failed to save changes');

// Show info message (4s duration)
showInfo('New features available');

// Show warning message (4s duration)
showWarning('Your subscription expires soon');

// Custom duration
const { addNotification } = useApp();
addNotification({
  type: 'success',
  message: 'Custom message',
  duration: 10000 // 10 seconds
});
```

#### Remove Notifications
```javascript
const { removeNotification, clearNotifications } = useApp();

// Remove specific notification
removeNotification(notificationId);

// Clear all notifications
clearNotifications();
```

#### Global Loading
```javascript
const { globalLoading, setGlobalLoading } = useApp();

setGlobalLoading(true);
// ... perform operation
setGlobalLoading(false);
```

---

## 🚀 Usage

### Setup in main.jsx

```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './state';
import App from './app/App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>
);
```

### Use in Components

#### Authentication
```javascript
import { useAuth } from '../state';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Application State
```javascript
import { useApp } from '../state';

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();
  
  return (
    <aside className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
      {/* Sidebar content */}
    </aside>
  );
}
```

#### Notifications
```javascript
import { useApp } from '../state';

function ProfileForm() {
  const { showSuccess, showError } = useApp();
  
  const handleSubmit = async (data) => {
    try {
      await updateProfile(data);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔄 Data Flow

### Authentication Flow
```
Component → useAuth() → AuthContext
              ↓
         authService (API call)
              ↓
         Update state → Re-render
```

### Notification Flow
```
Component → showSuccess() → AppContext
              ↓
         Add to notifications array
              ↓
         Auto-remove after duration
```

---

## 🎯 Best Practices

### 1. Always Check Loading State
```javascript
const { user, loading, isAuthenticated } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### 2. Handle Errors Gracefully
```javascript
const { login } = useAuth();
const { showError } = useApp();

const handleLogin = async (credentials) => {
  const result = await login(credentials);
  
  if (!result.success) {
    showError(result.error);
  }
};
```

### 3. Use Callbacks for Performance
```javascript
import { useCallback } from 'react';

const { login } = useAuth();

const handleLogin = useCallback(async (credentials) => {
  await login(credentials);
}, [login]);
```

### 4. Combine Multiple Contexts
```javascript
import { useAuth } from '../state';
import { useApp } from '../state';

function Dashboard() {
  const { user, logout } = useAuth();
  const { showSuccess, sidebarOpen } = useApp();
  
  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out successfully');
  };
  
  // ... component logic
}
```

---

## 🧪 Testing

### Mock AuthContext
```javascript
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com' },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

// Wrap component in test
<AuthContext.Provider value={mockAuthContext}>
  <MyComponent />
</AuthContext.Provider>
```

### Mock AppContext
```javascript
const mockAppContext = {
  sidebarOpen: true,
  toggleSidebar: jest.fn(),
  showSuccess: jest.fn(),
  showError: jest.fn(),
};
```

---

## 🔮 Future Enhancements

### 1. Add Company Context
Manage company-specific data and operations
```javascript
// src/state/CompanyContext.jsx
const CompanyContext = createContext(null);
```

### 2. Add Job Context
Manage job postings and applicant data
```javascript
// src/state/JobContext.jsx
const JobContext = createContext(null);
```

### 3. Persist State
Use localStorage to persist certain state
```javascript
// Save theme preference
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

### 4. Add Middleware
Implement Redux-style middleware for logging/debugging
```javascript
// src/state/middleware.js
export const logger = (state, action) => {
  console.log('Previous State:', state);
  console.log('Action:', action);
};
```

---

## 📚 Additional Resources

- [React Context API Docs](https://react.dev/reference/react/createContext)
- [useContext Hook](https://react.dev/reference/react/useContext)
- [State Management Patterns](https://react.dev/learn/managing-state)

---

## 🆘 Common Issues

### Issue: "useAuth must be used within AuthProvider"
**Solution**: Wrap your app with `<AppProviders>` in main.jsx

### Issue: State not updating
**Solution**: Make sure you're using the setter functions, not mutating state directly

### Issue: Too many re-renders
**Solution**: Use `useCallback` and `useMemo` to memoize functions and values

---

**Last Updated**: 2025-12-16  
**Version**: 1.0.0


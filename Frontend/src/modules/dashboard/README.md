# Dashboard Module

## Overview
The Dashboard Module provides a complete Job Manager Dashboard interface for companies to manage their job postings, search for applicants, and configure their account settings.

## Features

### 1. **Dashboard Layout**
- Fixed sidebar navigation
- Responsive design
- Collapsible sidebar
- Nested route support via React Router

### 2. **Sidebar Navigation**
- Dashboard overview
- Find Applicants search
- Post Manager (manage all job posts)
- Job Post creation/editing
- Settings (account, subscription, notifications)
- Company profile section with:
  - Company avatar
  - Company name
  - Subscription plan status indicator
  - Logout button

### 3. **Dashboard Pages**

#### Dashboard (Overview)
- Key metrics cards (Active Jobs, Total Applicants, Pending Reviews, Profile Views)
- Recent job posts table
- Quick action buttons

#### Find Applicants
- Advanced search with filters
- Applicant cards with match scores
- Skills display
- Contact and view actions

#### Post Manager
- Tabbed interface (All, Active, Closed, Drafts)
- Bulk actions support
- Sortable table view
- Status indicators
- Edit/Delete actions

#### Job Post
- Comprehensive job posting form
- Form validation
- Draft saving
- Preview functionality
- Tips sidebar
- Stats display

#### Settings
- Multi-section settings (Company, Account, Subscription, Notifications)
- Company profile editing
- Password change
- Subscription management
- Notification preferences with toggle switches
- Danger zone (account deletion)

## File Structure

```
src/modules/dashboard/
├── index.js                    # Main exports
├── hooks/
│   ├── index.js
│   └── useCompanyData.js      # Custom hook for company data
└── ui/
    ├── index.js
    ├── DashboardLayout.jsx     # Main layout with sidebar
    ├── Sidebar.jsx             # Navigation sidebar
    ├── DashboardPage.jsx       # Dashboard overview
    ├── FindApplicantsPage.jsx  # Applicant search
    ├── PostManagerPage.jsx     # Job post management
    ├── JobPostPage.jsx         # Create/edit job posts
    ├── SettingsPage.jsx        # Settings pages
    └── ProtectedRoute.jsx      # Route protection HOC
```

## Usage

### Basic Setup

1. **Import in App.jsx:**
```jsx
import {
  DashboardLayout,
  DashboardPage,
  FindApplicantsPage,
  PostManagerPage,
  JobPostPage,
  SettingsPage,
  ProtectedRoute,
} from '../modules/dashboard';
```

2. **Define Routes:**
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<DashboardPage />} />
  <Route path="find-applicants" element={<FindApplicantsPage />} />
  <Route path="post-manager" element={<PostManagerPage />} />
  <Route path="job-post" element={<JobPostPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>
```

### Protected Routes
The `ProtectedRoute` component checks for authentication token:
- If authenticated: renders children
- If not authenticated: redirects to `/login`

### Custom Hooks

#### useCompanyData
Fetches and manages company data:
```jsx
const { companyData, loading, error } = useCompanyData();
```

## Design System

### Color Palette
- **Primary:** `#E11D48` (Rose)
- **Primary Hover:** `#BE123C`
- **Dark:** `#111111`
- **Dark Black:** `#000000`
- **Light Gray:** `#F3F4F6`

### Typography
- Font weights: Bold (700), Black (900)
- Uppercase text for headers and buttons
- Semibold for body text

### Components
- **Borders:** 2px or 4px solid black
- **Buttons:** Uppercase, bold, with hover effects
- **Cards:** White background with black borders
- **Status badges:** Colored backgrounds with matching borders

## Todo: Backend Integration

### API Endpoints to Implement

1. **Company Profile:**
   - `GET /api/company/profile` - Get company data
   - `PUT /api/company/profile` - Update company data

2. **Job Posts:**
   - `GET /api/jobs` - List all job posts
   - `POST /api/jobs` - Create job post
   - `PUT /api/jobs/:id` - Update job post
   - `DELETE /api/jobs/:id` - Delete job post

3. **Applicants:**
   - `GET /api/applicants/search` - Search applicants
   - `GET /api/applicants/:id` - Get applicant details

4. **Authentication:**
   - `POST /api/auth/logout` - Logout
   - Token refresh logic

5. **Subscription:**
   - `GET /api/subscription` - Get subscription details
   - `PUT /api/subscription` - Update subscription

6. **Settings:**
   - `PUT /api/account/password` - Change password
   - `PUT /api/notifications/preferences` - Update notification settings

## State Management

Currently using:
- React useState for local state
- localStorage for token storage

**Recommended:** Add context/Redux for:
- User/Company data
- Authentication state
- Global settings

## Responsive Design

- Mobile: Single column layout, collapsed sidebar
- Tablet: 2-column grid for cards
- Desktop: Full multi-column layout

## Future Enhancements

1. Real-time notifications
2. Analytics dashboard with charts
3. Applicant messaging system
4. Advanced filtering and sorting
5. Export/Import functionality
6. Team member management
7. Role-based access control
8. Activity logs

## Testing

Add tests for:
- [ ] Route protection
- [ ] Form validation
- [ ] API integration
- [ ] Component rendering
- [ ] User interactions

## Performance Optimization

- [ ] Implement lazy loading for routes
- [ ] Add pagination for job posts/applicants
- [ ] Optimize re-renders with React.memo
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for large lists


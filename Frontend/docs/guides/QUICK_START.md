# 🚀 Quick Start Guide - Job Manager Dashboard

## Get Started in 3 Minutes!

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🏃‍♂️ Step 1: Install Dependencies (30 seconds)

```bash
cd "D:\JobManager - DEVision\Frontend"
npm install
```

Wait for packages to install (~30 seconds)

---

## 🎬 Step 2: Start Development Server (5 seconds)

```bash
npm run dev
```

You should see:
```
VITE v7.2.6  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help
```

---

## 🔐 Step 3: Access the Dashboard (1 minute)

### Option A: With Mock Authentication (Recommended for testing)

1. Open your browser to: `http://localhost:5173/`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Paste this code and press Enter:
   ```javascript
   localStorage.setItem('accessToken', 'mock-token-12345')
   ```
5. Navigate to: `http://localhost:5173/dashboard`
6. 🎉 **You're in!** Explore the dashboard

### Option B: Through Login Page (When backend is ready)

1. Open: `http://localhost:5173/login`
2. Enter your credentials
3. Login will set the token automatically
4. You'll be redirected to the dashboard

---

## 🗺️ Navigate the Dashboard

### Sidebar Menu
Click on any menu item to navigate:

| Icon | Menu Item | Description |
|------|-----------|-------------|
| 🏠 | **Dashboard** | Overview with stats and recent jobs |
| 🔍 | **Find Applicants** | Search for potential candidates |
| 📋 | **Post Manager** | Manage all your job postings |
| ➕ | **Job Post** | Create a new job posting |
| ⚙️ | **Settings** | Configure company and account settings |

### Company Profile Section (Bottom of Sidebar)
- View company name and avatar
- Check subscription status
- Click **LOGOUT** to sign out

---

## 🎯 Try These Features

### On Dashboard Page (`/dashboard`)
1. ✅ View stats cards (Active Jobs, Total Applicants, etc.)
2. ✅ Browse recent job posts in the table
3. ✅ Click quick action buttons

### On Find Applicants (`/dashboard/find-applicants`)
1. ✅ Type in the search box
2. ✅ Select experience level from dropdown
3. ✅ Enter location filter
4. ✅ Click "Search Applicants"
5. ✅ View applicant cards with match scores
6. ✅ Click "Contact" or "View" buttons

### On Post Manager (`/dashboard/post-manager`)
1. ✅ Switch between tabs (All, Active, Closed, Drafts)
2. ✅ Click checkboxes to select posts
3. ✅ Test bulk action buttons
4. ✅ Click edit/view/delete icons on rows

### On Job Post Page (`/dashboard/job-post`)
1. ✅ Fill in the job title (required)
2. ✅ Add department and location
3. ✅ Select job type and experience level
4. ✅ Write job description
5. ✅ Click "Publish Job Post" or "Save as Draft"
6. ✅ Try leaving required fields empty to see validation

### On Settings Page (`/dashboard/settings`)
1. ✅ Click "Company Profile" - edit company details
2. ✅ Click "Account Settings" - change password form
3. ✅ Click "Subscription" - view current plan
4. ✅ Click "Notifications" - toggle email preferences

---

## 🎨 Customize Your Experience

### Sidebar Collapse
- Click the **[≡]** icon in the sidebar header to collapse/expand
- Collapsed sidebar shows only icons
- Perfect for more screen space!

### Theme (Coming Soon)
The current theme uses:
- Primary color: Rose (#E11D48)
- Dark sidebar: (#111111)
- Light background: (#F3F4F6)

---

## 🐛 Troubleshooting

### Problem: Port 5173 is already in use
**Solution:**
```bash
# Kill the process on port 5173
npx kill-port 5173

# Or specify a different port
npm run dev -- --port 3000
```

### Problem: Dashboard redirects to login
**Solution:** You need to set the authentication token
```javascript
// In browser console
localStorage.setItem('accessToken', 'mock-token-12345')
```

### Problem: Blank page or errors
**Solution:**
1. Check browser console (F12) for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart the dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Problem: Changes not reflecting
**Solution:**
Vite has hot module replacement, but sometimes:
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 📱 Test Responsive Design

### Desktop View (Default)
Just open in your browser - you'll see the full layout

### Tablet View
1. Press `F12` to open DevTools
2. Click the **Toggle Device Toolbar** icon (or press `Ctrl+Shift+M`)
3. Select "iPad" or "iPad Pro" from dropdown
4. Observe layout changes

### Mobile View
1. Press `F12` to open DevTools
2. Click the **Toggle Device Toolbar** icon
3. Select "iPhone 12 Pro" or "Pixel 5"
4. See how sidebar adapts and grids stack

---

## 🎥 Demo Script (5-Minute Tour)

Follow this script for a quick demo:

1. **Start** → Open `/dashboard`
   - "Here's our dashboard overview with key metrics"
   - Scroll through stats cards

2. **Navigate** → Click "Find Applicants"
   - "We can search for potential candidates"
   - Show search filters
   - "Each card shows match score and skills"

3. **Navigate** → Click "Post Manager"
   - "Here we manage all job postings"
   - Switch tabs to show filtering
   - "We can bulk edit multiple posts"

4. **Navigate** → Click "Job Post"
   - "Creating a new job is easy"
   - Fill in a few fields
   - "We have validation for required fields"

5. **Navigate** → Click "Settings"
   - Switch through the 4 sections
   - "Company profile, account, subscription, notifications"

6. **Finish** → Show company profile at bottom
   - "Here's the company info and logout button"
   - Click logout to demonstrate

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F12` | Open DevTools |
| `Ctrl + K` | Focus search (when implemented) |
| `Ctrl + /` | Toggle sidebar (future feature) |
| `Esc` | Close modals (future feature) |

---

## 📊 What to Look For

### Visual Elements
- ✅ Bold, brutalist design with thick black borders
- ✅ Rose color (#E11D48) for primary actions
- ✅ Uppercase typography for headers
- ✅ Consistent spacing and alignment
- ✅ Smooth transitions and hover effects

### Interactions
- ✅ Sidebar navigation changes active state
- ✅ Forms validate on submit
- ✅ Buttons have hover effects
- ✅ Tables are scrollable on mobile
- ✅ Toggles animate smoothly

### Responsive Behavior
- ✅ Layout adapts to screen size
- ✅ Grids reflow from multi-column to single
- ✅ Sidebar collapses on mobile
- ✅ Text remains readable at all sizes

---

## 🎯 Next Steps After Testing

1. ✅ **Explore all pages** - Click everything!
2. ✅ **Test on mobile** - Use DevTools device mode
3. ✅ **Try the forms** - See validation in action
4. ✅ **Check the console** - Look for any errors
5. ✅ **Read the docs** - Check out IMPLEMENTATION_REPORT.md

### For Developers
- 📖 Read `INTEGRATION_GUIDE.md` for backend connection
- 📖 Check `src/modules/dashboard/README.md` for code structure
- 📖 Review component files for implementation details

### For Designers
- 🎨 Review design consistency across pages
- 🎨 Check color usage and typography
- 🎨 Verify responsive breakpoints
- 🎨 Test accessibility features

### For Product Managers
- 📊 Test user flows from start to finish
- 📊 Verify feature completeness
- 📊 Check if requirements are met
- 📊 Prepare feedback and next steps

---

## 🎉 Enjoy Exploring!

The dashboard is fully functional with mock data. All interactions work, forms validate, and navigation is smooth.

### Quick Links
- 🏠 Homepage: `http://localhost:5173/`
- 🔐 Login: `http://localhost:5173/login`
- 📊 Dashboard: `http://localhost:5173/dashboard`
- 🔍 Find Applicants: `http://localhost:5173/dashboard/find-applicants`
- 📋 Post Manager: `http://localhost:5173/dashboard/post-manager`
- ➕ Job Post: `http://localhost:5173/dashboard/job-post`
- ⚙️ Settings: `http://localhost:5173/dashboard/settings`

### Need Help?
- Check `TESTING_GUIDE.md` for detailed testing instructions
- See `IMPLEMENTATION_REPORT.md` for complete feature list
- Review `INTEGRATION_GUIDE.md` for backend connection

---

**Happy Testing! 🚀**

*Remember: You're testing with mock data. Real data integration requires backend setup (see INTEGRATION_GUIDE.md)*


# DEVision - Job Manager Frontend

> A modern, production-ready Job Manager Dashboard built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Access the app**: Open `http://localhost:5173/`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Overview

The Job Manager Frontend is a comprehensive dashboard application for companies to manage job postings, search for applicants, and configure their accounts. Built with modern React patterns and optimized for performance.

### Key Highlights
✅ **5 Complete Pages** - Dashboard, Find Applicants, Post Manager, Job Post, Settings  
✅ **Responsive Design** - Mobile, tablet, and desktop optimized  
✅ **Modern UI** - Brutalist design with bold typography and clean layouts  
✅ **Protected Routes** - Authentication-based access control  
✅ **Production Ready** - Zero errors, optimized build (~85KB gzipped)  

---

## ✨ Features

### Dashboard Overview
- Real-time statistics (Active Jobs, Applicants, Reviews, Views)
- Recent job posts table
- Quick action buttons

### Find Applicants
- Advanced search with filters
- Applicant cards with match scores
- Skills and experience display
- Contact and view actions

### Post Manager
- Tabbed interface (All, Active, Closed, Drafts)
- Bulk actions (Activate, Close, Delete)
- Status indicators and filters
- Edit, view, and delete actions

### Job Post Creation
- Comprehensive job posting form
- Real-time validation
- Draft saving functionality
- Preview mode
- Tips and stats sidebar

### Settings
- Company profile management
- Account settings and password change
- Subscription management
- Notification preferences

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **React Router** | 7.10.1 | Routing & Navigation |
| **Tailwind CSS** | 4.1.17 | Styling |
| **Vite** | 7.2.4 | Build Tool |
| **ESLint** | 9.39.1 | Code Quality |

---

## 📁 Project Structure

```
src/
├── app/
│   └── App.jsx                 # Main app with routing
├── modules/
│   ├── auth/                   # Authentication module
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ui/
│   └── dashboard/              # Dashboard module
│       ├── hooks/
│       │   └── useCompanyData.js
│       ├── ui/
│       │   ├── DashboardLayout.jsx
│       │   ├── Sidebar.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── FindApplicantsPage.jsx
│       │   ├── PostManagerPage.jsx
│       │   ├── JobPostPage.jsx
│       │   ├── SettingsPage.jsx
│       │   └── ProtectedRoute.jsx
│       └── README.md           # Module documentation
├── pages/
│   └── home/                   # Public pages
├── config/
│   ├── api.js                  # API configuration
│   └── env.js                  # Environment config
├── utils/
│   ├── HttpUtil.js
│   ├── tokenStorage.js
│   └── validators.js
├── state/
│   └── store.js                # State management
└── assets/
    └── ...                     # Static assets
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd "D:\JobManager - DEVision\Frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open browser to `http://localhost:5173/`
   - For dashboard access, see [QUICK_START.md](QUICK_START.md)

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Quick Start](docs/guides/QUICK_START.md)** - Get up and running quickly
- **[State Management](docs/guides/STATE_MANAGEMENT.md)** - Using React Context API
- **[Authentication](docs/authentication/AUTHENTICATION_FLOW.md)** - Auth flow and testing
- **[Integration Guide](docs/integration/INTEGRATION_GUIDE.md)** - Backend integration
- **[Testing Guide](docs/guides/TESTING_GUIDE.md)** - Testing best practices
- **[Quick Reference](docs/guides/QUICK_REFERENCE.md)** - Command cheat sheet

**See [docs/README.md](docs/README.md) for complete documentation index.**

---

## 💻 Development

### Available Scripts

```bash
# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVICE_URL=http://localhost:8081
```

### Code Style

- **Components**: PascalCase (e.g., `DashboardPage.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCompanyData.js`)
- **Utilities**: camelCase (e.g., `validators.js`)
- **Constants**: UPPER_SNAKE_CASE

---

## 🎨 Design System

### Colors
```css
Primary: #E11D48 (Rose)
Primary Hover: #BE123C
Dark: #111111
Dark Black: #000000
Light Gray: #F3F4F6
```

### Typography
- **Headings**: Font weight 900 (Black), Uppercase
- **Buttons**: Font weight 700 (Bold), Uppercase
- **Body**: Font weight 600 (Semibold)

### Borders
- **Input/Small Elements**: 2px solid black
- **Cards/Containers**: 4px solid black

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deployment Options

**Vercel** (Recommended)
```bash
npm install -g vercel
vercel deploy
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

### Environment Variables in Production

Set these in your deployment platform:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_AUTH_SERVICE_URL` - Authentication service URL

---

## 🧪 Testing

### Mock Authentication (for testing without backend)

Open browser console and run:
```javascript
localStorage.setItem('accessToken', 'mock-token-12345');
```

Then navigate to `/dashboard`

### Testing Checklist

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing instructions.

---

## 📊 Performance Metrics

Current build output:
```
dist/index.html                   0.48 kB
dist/assets/index-*.css          26.12 kB (gzip: 5.29 kB)
dist/assets/index-*.js          295.61 kB (gzip: 85.08 kB)
Build time: ~1.26s
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

---

## 📝 License

See [LICENSE](../LICENSE) file for details.

---

## 🆘 Support

### Common Issues

**Port already in use**
```bash
npx kill-port 5173
```

**Dashboard redirects to login**
```javascript
// Set mock token in browser console
localStorage.setItem('accessToken', 'mock-token-12345');
```

**Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

For more help, see [TESTING_GUIDE.md](TESTING_GUIDE.md) troubleshooting section.

---

## 📞 Contact

For questions or issues:
- Check documentation in `/Frontend/*.md` files
- Review inline code comments
- Contact the development team

---

## 🎉 Status

✅ **Production Ready**  
✅ **Zero Build Errors**  
✅ **Fully Documented**  
✅ **Responsive Design**  
✅ **Modern Tech Stack**  

---

**Built with ❤️ by the DEVision Team**

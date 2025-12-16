import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/home';
import { LoginPage, RegisterPage, VerifyPage } from '../modules/auth';
import {
  DashboardLayout,
  DashboardPage,
  FindApplicantsPage,
  PostManagerPage,
  JobPostPage,
  SettingsPage,
  ProtectedRoute,
} from '../modules/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyPage />} />

        {/* Protected Dashboard Routes */}
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
      </Routes>
    </Router>
  );
}

export default App;

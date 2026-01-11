import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/home";
import { LoginPage, RegisterPage, VerifyPage } from "../modules/auth";
import GoogleCallback from "../pages/GoogleCallback";
import {
  DashboardLayout,
  DashboardPage,
  FindApplicantsPage,
  PostManagerPage,
  JobPostPage,
  SettingsPage,
  ProtectedRoute,
} from "../modules/dashboard";
import ProfileView from "../modules/profile/ui/ProfileView";
import JobViewPage from "../modules/dashboard/ui/JobViewPage";
import ApplicantDetailPage from "../modules/dashboard/ui/ApplicantDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyPage />} />
        <Route path="/login/oauth2/code/google" element={<GoogleCallback />} />

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
          <Route path="post-manager/view" element={<JobViewPage />} />
          <Route path="job-post" element={<JobPostPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="applicant/:applicantId" element={<ApplicantDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

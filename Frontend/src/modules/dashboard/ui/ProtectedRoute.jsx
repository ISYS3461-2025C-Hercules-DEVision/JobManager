import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Route guard for authenticated users
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;


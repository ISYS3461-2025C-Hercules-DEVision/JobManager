import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { ProfileProvider } from './ProfileContext';

/**
 * Combined Providers
 * Wraps the entire app with all context providers
 */
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default AppProviders;


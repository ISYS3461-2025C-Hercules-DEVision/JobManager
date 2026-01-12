import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { ProfileProvider } from './ProfileContext';
import { NotificationProvider } from './NotificationContext';

/**
 * Combined Providers
 * Wraps the entire app with all context providers
 */
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        <ProfileProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ProfileProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default AppProviders;


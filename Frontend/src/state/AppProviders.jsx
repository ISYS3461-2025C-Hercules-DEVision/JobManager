import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';

/**
 * Combined Providers
 * Wraps the entire app with all context providers
 */
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
};

export default AppProviders;


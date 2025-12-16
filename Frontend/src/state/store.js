/**
 * Store - Legacy file for backwards compatibility
 * Modern state management is now in:
 * - AuthContext.jsx - Authentication state
 * - AppContext.jsx - Application state
 * - AppProviders.jsx - Combined providers
 *
 * Import from './state' or './state/index.js'
 */

export { AuthProvider, useAuth, AppProvider, useApp, AppProviders } from './index';


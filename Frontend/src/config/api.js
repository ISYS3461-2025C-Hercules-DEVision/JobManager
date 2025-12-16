/**
 * API Endpoints Configuration
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    VERIFY_EMAIL: '/verify-email',
    RESEND_VERIFICATION: '/resend-verification',
    GOOGLE_AUTH: '/google',
    REFRESH_TOKEN: '/refresh-token',
    ME: '/me',
  },

  // Company
  COMPANY: {
    BASE: '/company',
    PROFILE: '/company/profile',
    UPDATE: '/company/update',
  },

  // Job
  JOB: {
    BASE: '/job',
    CREATE: '/job/create',
    UPDATE: '/job/update',
    DELETE: '/job/delete',
    LIST: '/job/list',
  },

  // Subscription
  SUBSCRIPTION: {
    BASE: '/subscription',
    PLANS: '/subscription/plans',
    CURRENT: '/subscription/current',
  },
};


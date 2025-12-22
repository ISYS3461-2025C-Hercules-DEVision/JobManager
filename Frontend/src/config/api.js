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
    PROFILE: '/profile',
    PROFILE_STATUS: '/profile/status',
    PUBLIC_PROFILE: '/public-profile',
    UPDATE_PROFILE: '/profile',
    UPDATE_PUBLIC_PROFILE: '/public-profile',
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
    UPGRADE: '/subscription/upgrade',
    CANCEL: '/subscription/cancel',
    REACTIVATE: '/subscription/reactivate',
    BILLING_HISTORY: '/subscription/billing-history',
    INVOICE: '/subscription/invoice',
  },
};


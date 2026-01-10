/**
 * API Endpoints Configuration
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    LOGOUT: "/logout",
    VERIFY_EMAIL: "/verify-email",
    RESEND_VERIFICATION: "/resend-verification",
    GOOGLE_AUTH: "/google",
    REFRESH_TOKEN: "/refresh-token",
    ME: "/me",
  },

  // Company
  COMPANY: {
    BASE: "/company",
    PROFILE: "/profile",
    PROFILE_STATUS: "/profile/status",
    PUBLIC_PROFILE: "/public-profile",
    UPDATE_PROFILE: "/profile",
    UPDATE_PUBLIC_PROFILE: "/public-profile",
    UPLOAD_LOGO: "/public-profile/logo",
    UPLOAD_BANNER: "/public-profile/banner",
  },

  // Company Media
  COMPANY_MEDIA: {
    BASE: "/media",
    UPLOAD: "/media/upload",
    ACTIVE: "/media/active",
    BY_TYPE: "/media/type",
    REORDER: "/media/reorder",
    COUNT: "/media/count",
  },

  // Job
  JOB: {
    BASE: "/jobs",
    LIST: "/jobs/my",
    CREATE: "/jobs",
  },

  // Subscription
  SUBSCRIPTION: {
    BASE: "/subscriptions",
    CREATE: "/subscriptions",
    GET_BY_COMPANY: "/subscriptions/company",
    GET_BY_ID: "/subscriptions",
    GET_ALL: "/subscriptions",
    ACTIVATE: "/subscriptions/:id/activate",
    CANCEL: "/subscriptions/:id/cancel",
    CHECK_EXPIRED: "/subscriptions/check-expired",
  },

  // Payment
  PAYMENT: {
    BASE: "/payments",
    INITIATE: "/payments/initiate",
    COMPLETE: "/payments/complete",
    GET_BY_ID: "/payments",
    GET_CUSTOMER_PAYMENTS: "/payments/customer",
    GET_ALL: "/payments",
    CANCEL: "/payments/cancel",
    WEBHOOK: "/payments/webhook",
  },

  // Notification
  NOTIFICATION: {
    BASE: "/notifications",
    GET_BY_COMPANY: "/notifications",
    MARK_AS_READ: "/notifications/:id/read",
    DELETE: "/notifications/:id",
  },
};

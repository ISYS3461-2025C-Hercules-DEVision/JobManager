/**
 * Environment Configuration
 * Centralized environment variables for the application
 */

export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://13.236.146.126/:8000',

  // Authentication endpoints
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://13.236.146.126:8000/authentication',

  // Company Service endpoints
  COMPANY_SERVICE_URL: import.meta.env.VITE_COMPANY_SERVICE_URL || 'http://13.236.146.126:8000/company',

  // Subscription Service endpoints
  SUBSCRIPTION_SERVICE_URL:
    import.meta.env.VITE_SUBSCRIPTION_SERVICE_URL || "http://13.236.146.126:8000/subscription",

  // Payment Service endpoints
  PAYMENT_SERVICE_URL:
    import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://13.236.146.126:8000/payment",
  // Notification Service endpoints
  NOTIFICATION_SERVICE_URL:
    import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://13.236.146.126:8000/notification",

  // Mock mode for frontend-only development (set VITE_MOCK_AUTH=true to disable real API calls)
  MOCK_AUTH: import.meta.env.VITE_MOCK_AUTH === "true",

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",

  // Feature flags
  ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true",

  // App configuration
  APP_NAME: "Job Manager",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Development mode
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

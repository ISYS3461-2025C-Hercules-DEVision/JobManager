/**
 * Subscription Plans Configuration
 * Centralized plan definitions used across homepage and dashboard
 */

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    displayName: "Starter",
    price: 0,
    currency: "USD",
    period: "month",
    description: "Perfect for getting started",
    features: [
      "3 Job Postings Daily",
      "Basic Candidate Search",
      "Email Support",
      "Community Access",
    ],
    popular: false,
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    displayName: "Premium",
    price: 30,
    currency: "USD",
    period: "month",
    description: "For growing companies",
    features: [
      "Unlimited Job Postings",
      "Advanced Candidate Search",
      "AI-Powered Matching",
      "Priority Support 24/7",
      "Custom Branding",
      "Analytics Dashboard",
      "Export Reports",
      "API Access",
    ],
    popular: true,
  },
};

// Array format for easy iteration
export const PLANS_ARRAY = [PLANS.FREE, PLANS.PREMIUM];

export default PLANS;

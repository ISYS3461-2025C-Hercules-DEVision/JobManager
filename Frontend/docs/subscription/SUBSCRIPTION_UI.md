# Subscription UI Documentation

## Overview

The Subscription UI allows companies to view their current subscription plan, upgrade/downgrade plans, cancel subscriptions, and view billing history. This feature is integrated into the Settings page of the dashboard.

## Components

### SubscriptionSection

**Location:** `src/modules/dashboard/ui/SubscriptionSection.jsx`

The main component that handles all subscription-related UI functionality.

#### Features

1. **Current Plan Display**
   - Shows plan name (Free, Premium, Enterprise)
   - Displays subscription status with visual indicator (Active, Expired, Cancelled, Pending)
   - Shows price and billing period
   - Lists all plan features with checkmarks
   - Displays expiry date

2. **Plan Upgrade/Change Modal**
   - Shows all available plans in a comparison grid
   - Highlights the most popular plan
   - Displays features for each plan
   - Prevents selection of current plan
   - Shows plan pricing clearly

3. **Cancel Subscription Modal**
   - Lists features that will be lost
   - Shows warning about access retention until expiry date
   - Requires confirmation before cancellation

4. **Billing History Table**
   - Shows transaction date, description, amount, status
   - Provides invoice download option (ready for backend integration)
   - Responsive table design

#### Props

None - The component fetches data from ProfileContext and AppContext.

#### State Management

- Uses `useProfile()` hook to access company profile data
- Uses `useApp()` hook for toast notifications
- Local state for modal visibility and selected plan

#### Mock Data

Currently uses mock data for demonstration. Will be replaced with API calls:

```javascript
// Current subscription data (derived from profile.isPremium)
const currentSubscription = {
  planType: 'Premium' | 'Free',
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING',
  priceAmount: number,
  currency: 'USD',
  startDate: Date,
  expiryDate: Date,
  features: string[],
};

// Available plans
const plans = [
  {
    id: 'free' | 'premium' | 'enterprise',
    name: string,
    price: number,
    currency: string,
    period: 'month',
    description: string,
    features: string[],
    popular: boolean,
  }
];

// Billing history
const billingHistory = [
  {
    id: string,
    date: Date,
    amount: number,
    currency: string,
    status: 'Success' | 'Failed',
    description: string,
    invoiceUrl: string,
  }
];
```

## Services

### subscriptionService

**Location:** `src/modules/dashboard/services/subscriptionService.js`

Handles all subscription-related API calls.

#### Methods

##### getCurrentSubscription()
```javascript
const subscription = await subscriptionService.getCurrentSubscription();
```
Returns the current subscription details for the company.

##### getSubscriptionPlans()
```javascript
const plans = await subscriptionService.getSubscriptionPlans();
```
Returns all available subscription plans.

##### upgradePlan(planId)
```javascript
const result = await subscriptionService.upgradePlan('premium');
```
Upgrades or changes the subscription plan.

##### cancelSubscription(reason)
```javascript
const result = await subscriptionService.cancelSubscription('Too expensive');
```
Cancels the current subscription with an optional reason.

##### getBillingHistory(limit)
```javascript
const history = await subscriptionService.getBillingHistory(10);
```
Fetches billing history with optional limit (default: 10).

##### downloadInvoice(transactionId)
```javascript
const blob = await subscriptionService.downloadInvoice('txn-123');
```
Downloads invoice PDF as a blob.

##### reactivateSubscription()
```javascript
const result = await subscriptionService.reactivateSubscription();
```
Reactivates a cancelled subscription.

## API Endpoints

**Configuration:** `src/config/api.js`

```javascript
SUBSCRIPTION: {
  BASE: '/subscription',
  PLANS: '/subscription/plans',
  CURRENT: '/subscription/current',
  UPGRADE: '/subscription/upgrade',
  CANCEL: '/subscription/cancel',
  REACTIVATE: '/subscription/reactivate',
  BILLING_HISTORY: '/subscription/billing-history',
  INVOICE: '/subscription/invoice',
}
```

## Backend Integration Guide

### Step 1: Update SubscriptionSection Component

Replace mock data with API calls:

```javascript
import { subscriptionService } from '../services/subscriptionService';

// In SubscriptionSection component:
const [currentSubscription, setCurrentSubscription] = useState(null);
const [plans, setPlans] = useState([]);
const [billingHistory, setBillingHistory] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscription, availablePlans, history] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getSubscriptionPlans(),
        subscriptionService.getBillingHistory(),
      ]);
      setCurrentSubscription(subscription);
      setPlans(availablePlans);
      setBillingHistory(history);
    } catch (error) {
      showError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };
  
  loadSubscriptionData();
}, []);
```

### Step 2: Update Action Handlers

```javascript
const handleUpgradePlan = async (plan) => {
  try {
    const result = await subscriptionService.upgradePlan(plan.id);
    showSuccess('Plan upgraded successfully');
    setCurrentSubscription(result);
    setShowUpgradeModal(false);
  } catch (error) {
    showError('Failed to upgrade plan');
  }
};

const handleCancelSubscription = async () => {
  try {
    await subscriptionService.cancelSubscription();
    showSuccess('Subscription cancelled successfully');
    // Reload subscription data
    const updated = await subscriptionService.getCurrentSubscription();
    setCurrentSubscription(updated);
    setShowCancelModal(false);
  } catch (error) {
    showError('Failed to cancel subscription');
  }
};
```

### Step 3: Invoice Download

```javascript
const handleDownloadInvoice = async (transactionId) => {
  try {
    const blob = await subscriptionService.downloadInvoice(transactionId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${transactionId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Invoice downloaded');
  } catch (error) {
    showError('Failed to download invoice');
  }
};
```

## Usage

The Subscription UI is automatically integrated into the Settings page. Users can access it by:

1. Navigate to Dashboard → Settings
2. Click on "Subscription" in the sidebar navigation
3. View current plan details
4. Click "Upgrade Plan" or "Change Plan" to see available options
5. Click "Cancel Subscription" to initiate cancellation
6. View billing history in the table below

## Design Features

### Brutalist Design System

The subscription UI follows the app's brutalist design principles:

- **Bold Typography:** Font weights of 700-900 for headings
- **Strong Borders:** 2-4px solid black borders
- **Contrasting Colors:** Primary color (#FF6B35) with black and white
- **Clear Hierarchy:** Large headings, structured sections
- **Uppercase Text:** Button and label text in uppercase

### Responsive Design

- Mobile-first approach
- Grid layout adapts from 1 column (mobile) to 3 columns (desktop)
- Horizontal scrolling for billing history table on small screens
- Modal dialogs are scrollable on mobile

### Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Clear focus states
- Color contrast meets WCAG standards

## Status Indicators

Subscription status is displayed with color-coded badges:

- **Active:** Green (bg-green-500)
- **Expired:** Red (bg-red-500)
- **Cancelled:** Gray (bg-gray-500)
- **Pending:** Yellow (bg-yellow-500)

Each badge includes a pulsing dot animation for active subscriptions.

## Future Enhancements

1. **Payment Integration**
   - Stripe/PayPal integration for plan upgrades
   - Secure payment form
   - Payment method management

2. **Subscription Analytics**
   - Usage statistics
   - Cost analysis
   - ROI tracking

3. **Team Management**
   - Multi-user seats for enterprise plans
   - Role-based access control

4. **Promo Codes**
   - Apply discount codes
   - Special offers display

5. **Auto-renewal Settings**
   - Enable/disable auto-renewal
   - Renewal reminders

## Testing Checklist

- [ ] Current plan displays correctly
- [ ] Status badge shows correct status
- [ ] Features list renders properly
- [ ] Upgrade modal opens and displays all plans
- [ ] Current plan is disabled in upgrade modal
- [ ] Cancel modal shows warning and features
- [ ] Billing history table displays transactions
- [ ] Invoice download button triggers action
- [ ] Responsive design works on mobile
- [ ] Modals are scrollable on mobile
- [ ] Toast notifications appear for actions
- [ ] All buttons have proper hover states
- [ ] Component integrates with ProfileContext
- [ ] API error handling works correctly

## Troubleshooting

### Issue: Plan data not showing
**Solution:** Check that `profile.isPremium` is available in ProfileContext

### Issue: Modal not closing
**Solution:** Verify state management for modal visibility flags

### Issue: Billing history empty
**Solution:** Replace mock data with API call to backend

### Issue: Styling issues
**Solution:** Ensure Tailwind CSS classes are properly configured in tailwind.config.js

## Related Files

- `src/modules/dashboard/ui/SubscriptionSection.jsx` - Main component
- `src/modules/dashboard/ui/SettingsPage.jsx` - Parent component
- `src/modules/dashboard/services/subscriptionService.js` - API service
- `src/config/api.js` - API endpoints
- `src/state/ProfileContext.jsx` - Profile state management
- `src/state/AppContext.jsx` - App-wide state (toasts)

## Backend Requirements

The backend subscription service should provide:

### Entity: Subscription
```
- subscriptionId (UUID)
- companyId (UUID)
- planType (FREE | PREMIUM | ENTERPRISE)
- priceAmount (Decimal)
- currency (String)
- startDate (Date)
- expiryDate (Date)
- status (ACTIVE | EXPIRED | CANCELLED | PENDING)
- features (Array<String>)
- createdAt (Date)
- updatedAt (Date)
```

### Entity: PaymentTransaction
```
- transactionId (UUID)
- subscriptionId (UUID)
- companyId (UUID)
- amount (Decimal)
- currency (String)
- status (SUCCESS | FAILED)
- description (String)
- timestamp (Date)
- gateway (STRIPE | PAYPAL)
- invoiceUrl (String)
```

### Endpoints Required
- `GET /subscription/current` - Get current subscription
- `GET /subscription/plans` - Get available plans
- `POST /subscription/upgrade` - Upgrade/change plan
- `POST /subscription/cancel` - Cancel subscription
- `POST /subscription/reactivate` - Reactivate subscription
- `GET /subscription/billing-history` - Get payment history
- `GET /subscription/invoice/:transactionId` - Download invoice PDF

## Support

For questions or issues with the Subscription UI:
1. Check this documentation
2. Review the component code and comments
3. Test with mock data first
4. Verify API integration step by step
5. Check browser console for errors


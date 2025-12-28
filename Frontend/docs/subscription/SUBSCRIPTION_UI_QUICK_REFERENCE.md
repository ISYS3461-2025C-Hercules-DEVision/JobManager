# Subscription UI - Quick Reference

## 📍 Location
- **Component:** `src/modules/dashboard/ui/SubscriptionSection.jsx`
- **Service:** `src/modules/dashboard/services/subscriptionService.js`
- **Access:** Dashboard → Settings → Subscription tab

## 🎨 Features

### ✅ Current Plan Display
Shows active subscription with:
- Plan name & status badge
- Price & billing period
- Expiry date
- Feature list with checkmarks

### ✅ Plan Comparison Modal
- 3 plans: Free, Premium, Enterprise
- Feature comparison
- "Most Popular" badge
- Current plan disabled

### ✅ Cancellation Flow
- Warning modal
- Feature loss preview
- Confirmation required
- Retention notice

### ✅ Billing History
- Transaction table
- Invoice download links
- Date, amount, status
- Responsive design

## 🔧 Quick Integration

### 1. Import Component
```javascript
import { SubscriptionSection } from '../ui';
```

### 2. Use in Settings
```javascript
{activeSection === 'subscription' && (
  <SubscriptionSection />
)}
```

### 3. Backend Integration (Future)
```javascript
// Replace mock data with:
import { subscriptionService } from '../services/subscriptionService';

const subscription = await subscriptionService.getCurrentSubscription();
const plans = await subscriptionService.getSubscriptionPlans();
const history = await subscriptionService.getBillingHistory();
```

## 📦 Mock Data Structure

### Current Subscription
```javascript
{
  planType: 'Premium',      // 'Free' | 'Premium' | 'Enterprise'
  status: 'ACTIVE',         // 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  priceAmount: 99,
  currency: 'USD',
  startDate: Date,
  expiryDate: Date,
  features: string[]
}
```

### Plan
```javascript
{
  id: 'premium',
  name: 'Premium',
  price: 99,
  currency: 'USD',
  period: 'month',
  description: 'For growing companies',
  features: string[],
  popular: true
}
```

### Transaction
```javascript
{
  id: '1',
  date: Date,
  amount: 99,
  currency: 'USD',
  status: 'Success',        // 'Success' | 'Failed'
  description: 'Premium Plan - Monthly',
  invoiceUrl: '#'
}
```

## 🎯 API Endpoints

```javascript
GET    /subscription/current          // Current subscription
GET    /subscription/plans             // Available plans
POST   /subscription/upgrade           // Upgrade plan
POST   /subscription/cancel            // Cancel subscription
POST   /subscription/reactivate        // Reactivate
GET    /subscription/billing-history   // Payment history
GET    /subscription/invoice/:id       // Download invoice
```

## 🎨 Status Colors

| Status    | Color Class     | Badge Color |
|-----------|----------------|-------------|
| ACTIVE    | `bg-green-500` | Green       |
| EXPIRED   | `bg-red-500`   | Red         |
| CANCELLED | `bg-gray-500`  | Gray        |
| PENDING   | `bg-yellow-500`| Yellow      |

## 🚀 Key Functions

### Handle Upgrade
```javascript
const handleUpgradePlan = (plan) => {
  // TODO: API call
  showInfo('Plan upgrade coming soon');
};
```

### Handle Cancel
```javascript
const handleCancelSubscription = () => {
  // TODO: API call
  showInfo('Cancellation coming soon');
};
```

### Download Invoice
```javascript
const handleDownloadInvoice = (transactionId) => {
  // TODO: API call
  showInfo('Invoice download coming soon');
};
```

## 🔗 Context Dependencies

- **ProfileContext:** `profile.isPremium` for plan detection
- **AppContext:** `showSuccess()`, `showError()`, `showInfo()` for notifications

## 📱 Responsive Breakpoints

- **Mobile:** Single column layout, stacked cards
- **Tablet (md):** 2-column feature grid
- **Desktop (lg):** 3-column plan comparison

## ✨ UI Highlights

- **Brutalist Design:** Bold borders, strong typography
- **Animated Badge:** Pulsing dot for active status
- **Modal Overlays:** Full-screen on mobile, centered on desktop
- **Hover States:** All buttons have transition effects
- **Uppercase Labels:** Consistent with design system

## 🧪 Testing Locally

1. Navigate to Settings page
2. Click "Subscription" tab
3. Verify current plan displays (based on `profile.isPremium`)
4. Click "Upgrade Plan" → Modal opens
5. Click plan → Shows info toast
6. Click "Cancel Subscription" → Warning modal
7. Verify billing history table
8. Check responsive on mobile (DevTools)

## 📝 TODO for Backend Integration

- [ ] Replace mock `currentSubscription` with API
- [ ] Replace mock `plans` array with API
- [ ] Replace mock `billingHistory` with API
- [ ] Implement actual `handleUpgradePlan()`
- [ ] Implement actual `handleCancelSubscription()`
- [ ] Implement actual invoice download
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update ProfileContext after changes
- [ ] Add payment gateway integration

## 🐛 Common Issues

### Plan not displaying
→ Check `profile.isPremium` in ProfileContext

### Modal won't close
→ Verify `showUpgradeModal` state

### Styles not applying
→ Check Tailwind config includes component path

### Toast not showing
→ Verify AppContext provider wraps component

## 📚 Related Docs

- [Full Documentation](./SUBSCRIPTION_UI.md)
- [State Management](./guides/STATE_MANAGEMENT.md)
- [Integration Guide](./integration/INTEGRATION_GUIDE.md)
- [Backend ERD](../../Documents/Overview/ERD_Overview.md)

## 💡 Pro Tips

1. **Use Mock Data First:** Test UI before backend ready
2. **Check Profile Loading:** Handle loading states
3. **Toast Notifications:** Use for user feedback
4. **Status Indicators:** Visual feedback is important
5. **Mobile First:** Always test responsive design
6. **Error Boundaries:** Wrap in error handlers for production
7. **Accessibility:** Maintain keyboard navigation
8. **Performance:** Lazy load modal content if needed

---

**Status:** ✅ Frontend Complete | ⏳ Backend Integration Pending

**Last Updated:** December 22, 2024


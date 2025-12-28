import { useState } from 'react';
import { useProfile } from '../../../state/ProfileContext';
import { useApp } from '../../../state/AppContext';

/**
 * SubscriptionSection Component
 * Displays current subscription plan details and allows management
 * Features:
 * - Current plan display with features
 * - Plan comparison
 * - Upgrade/downgrade options
 * - Cancel subscription
 * - Billing history
 */
function SubscriptionSection() {
  const { profile } = useProfile();
  const { showSuccess, showError, showInfo } = useApp();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Mock subscription data - will be replaced with API data
  const currentSubscription = {
    planType: profile?.isPremium ? 'Premium' : 'Free',
    status: 'ACTIVE',
    priceAmount: profile?.isPremium ? 99 : 0,
    currency: 'USD',
    startDate: new Date('2024-12-01'),
    expiryDate: new Date('2026-01-15'),
    features: profile?.isPremium
      ? [
          'Unlimited job posts',
          'Advanced applicant search',
          'AI-powered candidate matching',
          'Priority support 24/7',
          'Custom branding',
          'Analytics dashboard',
          'Export reports',
          'API access',
        ]
      : [
          'Up to 3 job posts',
          'Basic applicant search',
          'Standard support',
        ],
  };

  // Available plans for upgrade
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 job posts',
        'Basic applicant search',
        'Standard support',
        'Community access',
      ],
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      currency: 'USD',
      period: 'month',
      description: 'For growing companies',
      features: [
        'Unlimited job posts',
        'Advanced applicant search',
        'AI-powered matching',
        'Priority support 24/7',
        'Custom branding',
        'Analytics dashboard',
        'Export reports',
        'API access',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      currency: 'USD',
      period: 'month',
      description: 'For large organizations',
      features: [
        'Everything in Premium',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security features',
        'Multi-user access',
        'Custom contracts',
        'On-premise deployment option',
      ],
      popular: false,
    },
  ];

  // Mock billing history - will be replaced with API data
  const billingHistory = [
    {
      id: '1',
      date: new Date('2024-12-01'),
      amount: 99,
      currency: 'USD',
      status: 'Success',
      description: 'Premium Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: '2',
      date: new Date('2024-11-01'),
      amount: 99,
      currency: 'USD',
      status: 'Success',
      description: 'Premium Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: '3',
      date: new Date('2024-10-01'),
      amount: 99,
      currency: 'USD',
      status: 'Success',
      description: 'Premium Plan - Monthly',
      invoiceUrl: '#',
    },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelSubscription = () => {
    // TODO: Implement API call to cancel subscription
    console.log('Cancelling subscription');
    setShowCancelModal(false);
    showInfo('Subscription cancellation will be available after backend integration');
  };

  const handleUpgradePlan = (plan) => {
    // TODO: Implement API call to upgrade/downgrade plan
    console.log('Upgrading to plan:', plan);
    setShowUpgradeModal(false);
    setSelectedPlan(null);
    showInfo('Plan upgrade will be available after backend integration');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'EXPIRED':
        return 'bg-red-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      case 'PENDING':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-white border-4 border-black">
        <div className={`${currentSubscription.planType === 'Premium' ? 'bg-primary' : 'bg-gray-800'} text-white p-6 border-b-4 border-black`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-3xl font-black uppercase">
                  {currentSubscription.planType} Plan
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(currentSubscription.status)} text-white`}>
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  {currentSubscription.status}
                </span>
              </div>
              <p className="font-bold text-lg">
                Active until {formatDate(currentSubscription.expiryDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black">${currentSubscription.priceAmount}</p>
              <p className="font-bold text-lg">/month</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {currentSubscription.features.map((feature, index) => (
              <p key={index} className="font-bold flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          {currentSubscription.planType !== 'Enterprise' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors"
            >
              {currentSubscription.planType === 'Free' ? 'Upgrade Plan' : 'Change Plan'}
            </button>
          )}

          {currentSubscription.planType !== 'Free' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border-4 border-black p-6">
        <h3 className="text-2xl font-black uppercase mb-6">Billing History</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-4 py-3 text-left font-black uppercase text-sm">Date</th>
                <th className="px-4 py-3 text-left font-black uppercase text-sm">Description</th>
                <th className="px-4 py-3 text-right font-black uppercase text-sm">Amount</th>
                <th className="px-4 py-3 text-center font-black uppercase text-sm">Status</th>
                <th className="px-4 py-3 text-center font-black uppercase text-sm">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-200">
                  <td className="px-4 py-4 font-semibold">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-4 font-semibold text-right">
                    ${transaction.amount} {transaction.currency}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      transaction.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => showInfo('Invoice download will be available after backend integration')}
                      className="text-primary hover:underline font-bold uppercase text-sm"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {billingHistory.length === 0 && (
          <div className="text-center py-8 text-gray-600 font-semibold">
            No billing history available
          </div>
        )}
      </div>

      {/* Upgrade/Change Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-4 border-black p-6 flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase">Choose Your Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white border-4 ${
                      plan.popular ? 'border-primary' : 'border-black'
                    } ${selectedPlan?.id === plan.id ? 'ring-4 ring-primary' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-white px-4 py-1 text-xs font-black uppercase">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-2xl font-black uppercase mb-2">{plan.name}</h3>
                      <p className="text-gray-600 font-semibold mb-4">{plan.description}</p>

                      <div className="mb-6">
                        <span className="text-5xl font-black">${plan.price}</span>
                        <span className="text-gray-600 font-bold">/{plan.period}</span>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start font-semibold">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          handleUpgradePlan(plan);
                        }}
                        disabled={currentSubscription.planType.toLowerCase() === plan.id}
                        className={`w-full px-6 py-3 font-bold uppercase border-2 border-black transition-colors ${
                          currentSubscription.planType.toLowerCase() === plan.id
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary-hover text-white'
                        }`}
                      >
                        {currentSubscription.planType.toLowerCase() === plan.id ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full">
            <div className="bg-primary text-white p-6 border-b-4 border-black">
              <h2 className="text-2xl font-black uppercase">Cancel Subscription</h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="font-semibold text-gray-700 mb-4">
                  Are you sure you want to cancel your subscription? You will lose access to:
                </p>
                <ul className="space-y-2 mb-4">
                  {currentSubscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start font-semibold text-gray-600">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="bg-yellow-50 border-2 border-yellow-500 p-4">
                  <p className="font-bold text-sm text-yellow-800">
                    ⚠️ Your subscription will remain active until {formatDate(currentSubscription.expiryDate)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold uppercase border-2 border-black transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold uppercase border-2 border-black transition-colors"
                >
                  Cancel Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionSection;


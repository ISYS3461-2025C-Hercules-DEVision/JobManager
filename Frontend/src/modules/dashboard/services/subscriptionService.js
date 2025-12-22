import { http } from '../../../utils/HttpUtil';
import { API_ENDPOINTS } from '../../../config/api';

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */

/**
 * Get current subscription details
 * @returns {Promise<Object>} Current subscription data
 */
export const getCurrentSubscription = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.SUBSCRIPTION.CURRENT);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current subscription:', error);
    throw error;
  }
};

/**
 * Get available subscription plans
 * @returns {Promise<Array>} List of available plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.SUBSCRIPTION.PLANS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    throw error;
  }
};

/**
 * Upgrade or change subscription plan
 * @param {string} planId - ID of the plan to upgrade to
 * @returns {Promise<Object>} Updated subscription data
 */
export const upgradePlan = async (planId) => {
  try {
    const response = await http.post(`${API_ENDPOINTS.SUBSCRIPTION.BASE}/upgrade`, {
      planId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upgrade plan:', error);
    throw error;
  }
};

/**
 * Cancel current subscription
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<Object>} Cancellation confirmation
 */
export const cancelSubscription = async (reason = '') => {
  try {
    const response = await http.post(`${API_ENDPOINTS.SUBSCRIPTION.BASE}/cancel`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
};

/**
 * Get billing history
 * @param {number} limit - Number of records to fetch (default: 10)
 * @returns {Promise<Array>} List of payment transactions
 */
export const getBillingHistory = async (limit = 10) => {
  try {
    const response = await http.get(`${API_ENDPOINTS.SUBSCRIPTION.BASE}/billing-history`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
    throw error;
  }
};

/**
 * Download invoice PDF
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Blob>} Invoice PDF blob
 */
export const downloadInvoice = async (transactionId) => {
  try {
    const response = await http.get(
      `${API_ENDPOINTS.SUBSCRIPTION.BASE}/invoice/${transactionId}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to download invoice:', error);
    throw error;
  }
};

/**
 * Reactivate cancelled subscription
 * @returns {Promise<Object>} Reactivation confirmation
 */
export const reactivateSubscription = async () => {
  try {
    const response = await http.post(`${API_ENDPOINTS.SUBSCRIPTION.BASE}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    throw error;
  }
};

export const subscriptionService = {
  getCurrentSubscription,
  getSubscriptionPlans,
  upgradePlan,
  cancelSubscription,
  getBillingHistory,
  downloadInvoice,
  reactivateSubscription,
};


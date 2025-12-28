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
 * Get subscription by ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscriptionById = async (subscriptionId) => {
  try {
    const response = await subscriptionClient.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw error;
  }
};

/**
 * Get all subscriptions (admin)
 * @returns {Promise<Array>} List of all subscriptions
 */
export const getAllSubscriptions = async () => {
  try {
    const response = await subscriptionClient.get('/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all subscriptions:', error);
    throw error;
  }
};

/**
 * Activate a subscription with payment
 * @param {string} subscriptionId - Subscription ID
 * @param {string} paymentId - Payment transaction ID
 * @returns {Promise<Object>} Activated subscription data
 */
export const activateSubscription = async (subscriptionId, paymentId) => {
  try {
    const response = await subscriptionClient.put(`/subscriptions/${subscriptionId}/activate`, null, {
      params: { paymentId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to activate subscription:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Cancelled subscription data
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await subscriptionClient.put(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
};

/**
 * Check for expired subscriptions (admin)
 * @returns {Promise<Array>} List of expired subscriptions
 */
export const checkExpiredSubscriptions = async () => {
  try {
    const response = await subscriptionClient.post('/subscriptions/check-expired');
    return response.data;
  } catch (error) {
    console.error('Failed to check expired subscriptions:', error);
    throw error;
  }
};

export default {
  createSubscription,
  getSubscriptionByCompanyId,
  getCurrentSubscription,
  getSubscriptionById,
  getAllSubscriptions,
  activateSubscription,
  cancelSubscription,
  checkExpiredSubscriptions,
};
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


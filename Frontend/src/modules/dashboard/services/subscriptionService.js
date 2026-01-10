/**
 * Subscription Service
 * Handles subscription-related API calls (Subscription backend service)
 */

import { httpClient } from '../../../utils/HttpUtil';
import { ENV } from '../../../config/env';
import { API_ENDPOINTS } from '../../../config/api';

const baseUrl = ENV.SUBSCRIPTION_SERVICE_URL;

export const createSubscription = async ({ companyId, planType }) => {
  const response = await httpClient.post(
    `${baseUrl}${API_ENDPOINTS.SUBSCRIPTION.CREATE}`,
    { companyId, planType }
  );
  return response.data;
};

export const getSubscriptionByCompanyId = async (companyId) => {
  const response = await httpClient.get(
    `${baseUrl}${API_ENDPOINTS.SUBSCRIPTION.GET_BY_COMPANY}/${companyId}`
  );
  return response.data;
};

export const getSubscriptionById = async (subscriptionId) => {
  const response = await httpClient.get(
    `${baseUrl}${API_ENDPOINTS.SUBSCRIPTION.GET_BY_ID}/${subscriptionId}`
  );
  return response.data;
};

export const activateSubscription = async (subscriptionId, paymentId) => {
  const response = await httpClient.put(
    `${baseUrl}/subscriptions/${subscriptionId}/activate`,
    null,
    { params: { paymentId } }
  );
  return response.data;
};

export const cancelSubscription = async (subscriptionId) => {
  const response = await httpClient.put(
    `${baseUrl}/subscriptions/${subscriptionId}/cancel`
  );
  return response.data;
};

export const checkExpiredSubscriptions = async () => {
  const response = await httpClient.post(
    `${baseUrl}${API_ENDPOINTS.SUBSCRIPTION.CHECK_EXPIRED}`
  );
  return response.data;
};

export default {
  createSubscription,
  getSubscriptionByCompanyId,
  getSubscriptionById,
  activateSubscription,
  cancelSubscription,
  checkExpiredSubscriptions,
};


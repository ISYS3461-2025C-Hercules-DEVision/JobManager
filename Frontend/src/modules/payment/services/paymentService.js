/**
 * Payment Service
 * Handles all payment-related API calls
 */

import { httpClient } from '../../../utils/HttpUtil';
import { ENV } from '../../../config/env';
import { API_ENDPOINTS } from '../../../config/api';

// Payment is implemented inside the Subscription backend in this repo.
// Keep this configurable via ENV in case you route through a gateway.
const PAYMENT_BASE_URL = ENV.PAYMENT_SERVICE_URL;

/**
 * Initiate a payment
 * Creates a Stripe Checkout Session and returns the URL for user redirect
 * @param {Object} paymentData - Payment initiation details
 * @param {string} paymentData.subsystem - "JOB_MANAGER" or "JOB_APPLICANT"
 * @param {string} paymentData.paymentType - "SUBSCRIPTION", "PREMIUM_FEATURE", or "ONE_TIME"
 * @param {string} paymentData.customerId - Company ID or Applicant ID
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.referenceId - Subscription ID, feature ID, etc.
 * @param {number} paymentData.amount - Amount in cents (e.g., 3000 for $30.00)
 * @param {string} paymentData.currency - "USD", "EUR", etc.
 * @param {string} paymentData.gateway - "STRIPE" or "PAYPAL"
 * @param {string} paymentData.description - Optional description
 * @returns {Promise<Object>} Payment initiate response with checkout URL
 */
export const initiatePayment = async (paymentData) => {
  try {
    const response = await httpClient.post(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.INITIATE}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Failed to initiate payment:', error);
    throw error;
  }
};

/**
 * Complete a payment after Stripe redirect
 * @param {string} sessionId - Stripe session ID from success URL
 * @returns {Promise<Object>} Completed payment details
 */
export const completePayment = async (sessionId) => {
  try {
    const response = await httpClient.get(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.COMPLETE}`, {
      params: { sessionId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to complete payment:', error);
    throw error;
  }
};

/**
 * Get payment details by transaction ID
 * @param {string} transactionId - Payment transaction ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentById = async (transactionId) => {
  try {
    const response = await httpClient.get(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.GET_BY_ID}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment:', error);
    throw error;
  }
};

/**
 * Get payment history for a specific customer
 * @param {string} customerId - Customer ID (companyId or applicantId)
 * @returns {Promise<Array>} List of customer payments
 */
export const getCustomerPayments = async (customerId) => {
  try {
    const response = await httpClient.get(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.GET_CUSTOMER_PAYMENTS}/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch customer payments:', error);
    throw error;
  }
};

/**
 * Get all payments (admin only)
 * @returns {Promise<Array>} List of all payments
 */
export const getAllPayments = async () => {
  try {
    const response = await httpClient.get(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.GET_ALL}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all payments:', error);
    throw error;
  }
};

/**
 * Handle payment cancellation
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelPayment = async (sessionId) => {
  try {
    const response = await httpClient.get(`${PAYMENT_BASE_URL}${API_ENDPOINTS.PAYMENT.CANCEL}`, {
      params: { sessionId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cancel payment:', error);
    throw error;
  }
};

export default {
  initiatePayment,
  completePayment,
  getPaymentById,
  getCustomerPayments,
  getAllPayments,
  cancelPayment,
};


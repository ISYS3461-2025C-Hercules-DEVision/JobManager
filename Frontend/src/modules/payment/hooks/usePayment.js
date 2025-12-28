/**
export default usePayment;

};
  };
    cancel,
    getHistory,
    getById,
    complete,
    initiate,
    paymentHistory,
    error,
    loading,
  return {

  }, []);
    }
      setLoading(false);
    } finally {
      throw new Error(errorMessage);
      console.error('Error cancelling payment:', err);
      setError(errorMessage);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel payment';
    } catch (err) {
      return response;
      const response = await cancelPayment(sessionId);
    try {

    setError(null);
    setLoading(true);
  const cancel = useCallback(async (sessionId) => {
   */
   * @returns {Promise<Object>} Cancellation response
   * @param {string} sessionId - Stripe session ID
   * Cancel a payment
  /**

  }, []);
    }
      setLoading(false);
    } finally {
      throw new Error(errorMessage);
      console.error('Error fetching payment history:', err);
      setError(errorMessage);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch payment history';
    } catch (err) {
      return response;
      setPaymentHistory(response);
      const response = await getCustomerPayments(customerId);
    try {

    setError(null);
    setLoading(true);
  const getHistory = useCallback(async (customerId) => {
   */
   * @returns {Promise<Array>} Payment history
   * @param {string} customerId - Customer ID (companyId)
   * Get payment history for a customer
  /**

  }, []);
    }
      setLoading(false);
    } finally {
      throw new Error(errorMessage);
      console.error('Error fetching payment:', err);
      setError(errorMessage);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch payment';
    } catch (err) {
      return response;
      const response = await getPaymentById(transactionId);
    try {

    setError(null);
    setLoading(true);
  const getById = useCallback(async (transactionId) => {
   */
   * @returns {Promise<Object>} Payment details
   * @param {string} transactionId - Payment transaction ID
   * Get payment by transaction ID
  /**

  }, []);
    }
      setLoading(false);
    } finally {
      throw new Error(errorMessage);
      console.error('Error completing payment:', err);
      setError(errorMessage);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete payment';
    } catch (err) {
      return response;
      const response = await completePayment(sessionId);
    try {

    setError(null);
    setLoading(true);
  const complete = useCallback(async (sessionId) => {
   */
   * @returns {Promise<Object>} Completed payment details
   * @param {string} sessionId - Stripe session ID
   * Complete a payment after Stripe redirect
  /**

  }, []);
    }
      setLoading(false);
    } finally {
      throw new Error(errorMessage);
      console.error('Error initiating payment:', err);
      setError(errorMessage);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate payment';
    } catch (err) {
      return response;

      }
        window.location.href = response.checkoutUrl;
      if (response.checkoutUrl) {
      // Redirect to Stripe Checkout

      const response = await initiatePayment(paymentData);
    try {

    setError(null);
    setLoading(true);
  const initiate = useCallback(async (paymentData) => {
   */
   * @returns {Promise<Object>} Payment initiate response
   * @param {Object} paymentData - Payment initiation details
   * Initiate a payment and redirect to Stripe
  /**

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
export const usePayment = () => {
 */
 * @returns {Object} Payment state and actions
 * Custom hook for payments
/**

} from '../services/paymentService';
  cancelPayment
  getCustomerPayments,
  getPaymentById,
  completePayment,
  initiatePayment,
import {
import { useState, useCallback } from 'react';

 */
 * Custom hook for managing payments
 * usePayment Hook


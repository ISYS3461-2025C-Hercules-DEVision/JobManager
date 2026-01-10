/**
 * usePayment Hook
 * Custom hook for managing payments
 */

import { useCallback, useState } from 'react';
import {
  cancelPayment,
  completePayment,
  getCustomerPayments,
  getPaymentById,
  initiatePayment,
} from '../services/paymentService';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const initiate = useCallback(async (paymentData, { redirect = true } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await initiatePayment(paymentData);

      if (redirect && response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      }

      return response;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to initiate payment';
      setError(errorMessage);
      console.error('Error initiating payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      return await completePayment(sessionId);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to complete payment';
      setError(errorMessage);
      console.error('Error completing payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);

    try {
      return await getPaymentById(transactionId);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to fetch payment';
      setError(errorMessage);
      console.error('Error fetching payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);

    try {
      const payments = await getCustomerPayments(customerId);
      setPaymentHistory(payments);
      return payments;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to fetch payment history';
      setError(errorMessage);
      console.error('Error fetching payment history:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      return await cancelPayment(sessionId);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to cancel payment';
      setError(errorMessage);
      console.error('Error cancelling payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    paymentHistory,
    initiate,
    complete,
    getById,
    getHistory,
    cancel,
  };
};

export default usePayment;


/**
 * useSubscription Hook
 * Custom hook for managing subscriptions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createSubscription,
  getSubscriptionByCompanyId,
  getSubscriptionById,
  activateSubscription,
  cancelSubscription,
} from '../services/subscriptionService';

/**
 * Custom hook for subscriptions
 * @param {string} companyId - Company ID
 * @returns {Object} Subscription state and actions
 */
export const useSubscription = (companyId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch subscription by company ID
   */
  const fetchSubscription = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getSubscriptionByCompanyId(companyId);
      setSubscription(data);
    } catch (err) {
      // If subscription doesn't exist (404), it's not an error
      if (err.response?.status === 404) {
        setSubscription(null);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch subscription';
        setError(errorMessage);
        console.error('Error fetching subscription:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /**
   * Create a new subscription
   * @param {Object} subscriptionData - Subscription creation details
   * @returns {Promise<Object>} Created subscription
   */
  const create = useCallback(async (subscriptionData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await createSubscription(subscriptionData);
      setSubscription(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create subscription';
      setError(errorMessage);
      console.error('Error creating subscription:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get subscription by ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  const getById = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSubscriptionById(subscriptionId);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('Error fetching subscription by ID:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Activate subscription with payment
   * @param {string} subscriptionId - Subscription ID
   * @param {string} paymentId - Payment transaction ID
   * @returns {Promise<Object>} Activated subscription
   */
  const activate = useCallback(async (subscriptionId, paymentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await activateSubscription(subscriptionId, paymentId);
      setSubscription(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to activate subscription';
      setError(errorMessage);
      console.error('Error activating subscription:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Cancelled subscription
   */
  const cancel = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await cancelSubscription(subscriptionId);
      setSubscription(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel subscription';
      setError(errorMessage);
      console.error('Error cancelling subscription:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if subscription is active
   */
  const isActive = useCallback(() => {
    return subscription?.status === 'ACTIVE';
  }, [subscription]);

  /**
   * Check if subscription is pending
   */
  const isPending = useCallback(() => {
    return subscription?.status === 'PENDING';
  }, [subscription]);

  /**
   * Get days remaining until expiry
   */
  const getDaysRemaining = useCallback(() => {
    if (!subscription?.expiryDate) return 0;

    const expiry = new Date(subscription.expiryDate);
    const now = new Date();
    const diff = expiry - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return Math.max(0, days);
  }, [subscription]);

  // Fetch subscription on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    create,
    getById,
    activate,
    cancel,
    refetch: fetchSubscription,
    isActive,
    isPending,
    getDaysRemaining,
  };
};

export default useSubscription;


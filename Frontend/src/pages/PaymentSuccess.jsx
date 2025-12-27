/**
export default PaymentSuccess;

};
  );
    </div>
      </div>
        </button>
          Go to Dashboard Now
        >
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/dashboard')}
        <button

        </p>
          Redirecting you to dashboard in 3 seconds...
        <p className="text-sm text-gray-500 mb-4">

        )}
          </div>
            </div>
              )}
                </div>
                  <span className="font-medium text-gray-900">{payment.description}</span>
                  <span className="text-gray-600">Description:</span>
                <div className="flex justify-between">
              {payment.description && (
              </div>
                <span className="font-medium text-green-600">{payment.status}</span>
                <span className="text-gray-600">Status:</span>
              <div className="flex justify-between">
              </div>
                </span>
                  {payment.currency} ${(payment.amount / 100).toFixed(2)}
                <span className="font-medium text-gray-900">
                <span className="text-gray-600">Amount:</span>
              <div className="flex justify-between">
              </div>
                <span className="font-medium text-gray-900">{payment.transactionId}</span>
                <span className="text-gray-600">Transaction ID:</span>
              <div className="flex justify-between">
            <div className="space-y-2">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        {payment && (

        </p>
          Your payment has been processed successfully.
        <p className="text-gray-600 mb-6">

        </h2>
          Payment Successful!
        <h2 className="text-2xl font-bold text-gray-900 mb-2">

        </div>
          </svg>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
  return (

  }
    );
      </div>
        </div>
          </button>
            Return to Dashboard
          >
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => navigate('/dashboard')}
          <button
          </p>
            {error}
          <p className="text-gray-600 mb-6">
          </h2>
            Payment Failed
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
          </div>
            </svg>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
    return (
  if (error) {

  }
    );
      </div>
        </div>
          </p>
            Please wait while we confirm your payment
          <p className="text-gray-600">
          </h2>
            Processing Payment...
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-center">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
    return (
  if (processing) {

  };
    }
      setProcessing(false);
    } finally {
      setError(err.message || 'Failed to complete payment');
      console.error('Payment completion failed:', err);
    } catch (err) {
      }, 3000);
        navigate(returnUrl);
        sessionStorage.removeItem('returnUrl');
        const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard';
      setTimeout(() => {
      // Redirect to dashboard after 3 seconds

      setPayment(paymentData);
      const paymentData = await complete(sessionId);
      setProcessing(true);
    try {
  const completePaymentFlow = async () => {

  }, [sessionId]);
    }
      setProcessing(false);
      setError('No session ID provided');
    } else {
      completePaymentFlow();
    if (sessionId) {
  useEffect(() => {

  const sessionId = searchParams.get('session_id');

  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(true);

  const { complete } = usePayment();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const PaymentSuccess = () => {

import { usePayment } from '../../modules/payment/hooks/usePayment';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

 */
 * Handles Stripe redirect after successful payment
 * Payment Success Page


/**
 * Payment Cancel Page
 * Handles when user cancels Stripe checkout
 */

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Log cancellation
    console.log('Payment cancelled for session:', sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h2>

        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> You can try again anytime. Your subscription details have been saved.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/subscription')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-400 mt-4">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentCancel;


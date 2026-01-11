/**
export default PaymentSuccess;
/**
 * Payment Success Page
 * Handles Stripe redirect after successful payment
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePayment } from "../modules/payment/hooks/usePayment";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { complete } = usePayment();

  const sessionId = useMemo(
    () => searchParams.get("session_id"),
    [searchParams]
  );
  const [processing, setProcessing] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setProcessing(false);
        setError("No session ID provided");
        return;
      }

      try {
        setProcessing(true);
        const paymentData = await complete(sessionId);
        setPayment(paymentData);

        setTimeout(() => {
          const returnUrl = sessionStorage.getItem("returnUrl") || "/dashboard";
          sessionStorage.removeItem("returnUrl");
          navigate(returnUrl);
        }, 3000);
      } catch (err) {
        console.error("Payment completion failed:", err);
        setError(err.message || "Failed to complete payment");
      } finally {
        setProcessing(false);
      }
    };

    run();
  }, [complete, navigate, sessionId]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Processing Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>

        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-900">
                  {payment.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">
                  {payment.status}
                </span>
              </div>
              {payment.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-gray-900">
                    {payment.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          Redirecting you to dashboard in 3 seconds...
        </p>

        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
const sessionId = searchParams.get("session_id");

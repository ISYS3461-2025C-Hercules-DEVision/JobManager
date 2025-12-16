import { useState, useEffect } from 'react';

/**
 * useCompanyData - Custom hook to fetch and manage company data
 * @returns {Object} Company data and loading state
 */
function useCompanyData() {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch company data from API
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/company/profile');
        // const data = await response.json();

        // Mock data for now
        const mockData = {
          companyId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Tech Corp',
          email: 'contact@techcorp.com',
          avatar: null,
          subscriptionPlan: 'Premium',
          subscriptionStatus: 'Active',
          subscriptionExpiry: '2026-01-15',
        };

        setCompanyData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  return { companyData, loading, error };
}

export default useCompanyData;


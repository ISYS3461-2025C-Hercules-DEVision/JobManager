import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    phoneNumber: '',
    country: '',
    city: '',
    streetAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Integrate with backend API
      console.log('Register:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration with auto-login
      // TODO: Replace with actual tokens from backend API response
      const mockAccessToken = `access_token_${Date.now()}`;
      const mockRefreshToken = `refresh_token_${Date.now()}`;

      localStorage.setItem('accessToken', mockAccessToken);
      localStorage.setItem('refreshToken', mockRefreshToken);

      // On success, navigate to dashboard (auto-login after registration)
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    formData,
    loading,
    error,
    handleChange,
    handleSubmit
  };
};

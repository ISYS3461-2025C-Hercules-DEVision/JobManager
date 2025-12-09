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
      
      // On success, navigate to login
      navigate('/login');
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

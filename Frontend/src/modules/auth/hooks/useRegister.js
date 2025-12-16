import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password confirmation
    if (formData.password !== formData.passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    // If user clicks "Create Profile" on step 1, register immediately and go to verify page
    if (step === 1) {
      setLoading(true);
      setError(null);

      try {
        await authService.register({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          country: formData.country,
          city: formData.city,
          streetAddress: formData.streetAddress,
        });

        console.log('✅ Registration successful - Please verify your email');
        setRegistrationSuccess(true);

        setTimeout(() => {
          navigate('/verify-email', {
            state: {
              email: formData.email,
            }
          });
        }, 700);
      } catch (err) {
        console.error('❌ Registration failed:', err);
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (step < 3) {
      setStep(step + 1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend API
      await authService.register({
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        streetAddress: formData.streetAddress,
      });

      console.log('✅ Registration successful - Please verify your email');

      // Show success message and redirect to verification page or login
      setRegistrationSuccess(true);

      // Navigate to verification page with email prefilled
      setTimeout(() => {
        navigate('/verify-email', {
          state: {
            email: formData.email,
          }
        });
      }, 700);

    } catch (err) {
      console.error('❌ Registration failed:', err);
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
    registrationSuccess,
    handleChange,
    handleSubmit
  };
};

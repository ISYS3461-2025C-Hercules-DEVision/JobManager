import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../state/AuthContext';
import { useProfile } from '../../../state/ProfileContext';

export const useLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { loadProfile } = useProfile();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend API and update auth context
      await authLogin({
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login successful');

      // Load profile data before navigating to ensure it's available
      await loadProfile();

      console.log('✅ Profile loaded');

      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit
  };
};

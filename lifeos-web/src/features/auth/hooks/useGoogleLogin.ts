import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';

const useGoogleLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('access_token');
    if (token) {
      login(token);
      setSearchParams({}, { replace: true });
      navigate('/', { replace: true });
    }
  }, [searchParams, login, navigate, setSearchParams]);

  const redirectToGoogle = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/';
    const cleanUrl = apiUrl.replace(/\/$/, '');
    window.location.href = `${cleanUrl}/auth/google`;
  };

  return { redirectToGoogle, loading };
};

export default useGoogleLogin;

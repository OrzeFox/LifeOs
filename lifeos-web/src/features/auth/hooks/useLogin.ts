import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../../../store/useAuthStore';

const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (mode: 'login' | 'register', email: string, password: string, name?: string) => {
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name);
      login(res.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, submit };
};

export default useLogin;

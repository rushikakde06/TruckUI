// Authentication and state management hooks
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { authAPI } from '../services/api';

// AuthContext types
export interface AuthUser {
  email: string;
  id: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// useAuth Hook
// ============================================
export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => {
    // Restore token from localStorage
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      token,
      user,
      isLoading: false,
      error: null,
    };
  });

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authAPI.login(email, password);

        // Parse JWT to extract user info (basic parsing)
        const tokenParts = response.access_token.split('.');
        let user = { email, id: '', role: 'user' };

        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            user = {
              email: payload.email || email,
              id: payload.sub || '',
              role: payload.role || 'user',
            };
          } catch (e) {
            console.error('Failed to parse JWT:', e);
          }
        }

        // Store token and user
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        setState({
          token: response.access_token,
          user,
          isLoading: false,
          error: null,
        });

        navigate('/dashboard');
        return true;
      } catch (err: any) {
        const error = err.message || 'Login failed';
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return false;
      }
    },
    [navigate]
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setState({
      token: null,
      user: null,
      isLoading: false,
      error: null,
    });
    navigate('/');
  }, [navigate]);

  // Check if user is authenticated
  const isAuthenticated = !!state.token;

  return {
    ...state,
    isAuthenticated,
    login,
    logout,
  };
};

// ============================================
// useFetch Hook for API calls
// ============================================
export interface UseFetchOptions {
  skip?: boolean;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

export const useFetch = <T,>(
  fetchFn: (token: string) => Promise<T>,
  token: string | null,
  options: UseFetchOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options.skip || !token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(token);
        setData(result);
        options.onSuccess?.(result);
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to fetch data';
        setError(errorMsg);
        options.onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, fetchFn, options.skip]);

  const refetch = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(token);
      setData(result);
      options.onSuccess?.(result);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch data';
      setError(errorMsg);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchFn]);

  return { data, loading, error, refetch };
};

// ============================================
// useRealTimeUpdates Hook (WebSocket)
// ============================================
export const useRealTimeUpdates = (vehicleId: string, token: string | null) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !vehicleId) return;

    // For now, return a stub (WebSocket needs proper backend implementation)
    // In production, connect to WebSocket endpoint
    console.log(`Connecting to real-time updates for vehicle ${vehicleId}`);

    const handleUpdate = (message: any) => {
      setData(message);
    };

    // Mock connection
    setIsConnected(true);

    return () => {
      setIsConnected(false);
    };
  }, [vehicleId, token]);

  return { data, isConnected };
};

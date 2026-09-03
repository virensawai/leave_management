import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if there's a stored token and fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.data.user);
      setStudent(res.data.data.student);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    // Fetch full profile including student data
    await fetchUser();
    return userData;
  }

  async function register(formData) {
    const res = await authAPI.register(formData);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    await fetchUser();
    return userData;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setStudent(null);
  }

  const value = {
    user,
    student,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

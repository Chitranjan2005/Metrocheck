import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('metrocheck_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('metrocheck_token');
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('metrocheck_token');
        localStorage.removeItem('metrocheck_user');
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  function persist(token, user) {
    localStorage.setItem('metrocheck_token', token);
    localStorage.setItem('metrocheck_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    persist(res.data.token, res.data.user);
  }

  async function register(name, email, password, role) {
    const res = await api.post('/api/auth/register', { name, email, password, role });
    persist(res.data.token, res.data.user);
  }

  function logout() {
    localStorage.removeItem('metrocheck_token');
    localStorage.removeItem('metrocheck_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

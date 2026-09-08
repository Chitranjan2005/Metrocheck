import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconLogo } from '../components/Icons';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'inspector' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.role);
      }
      navigate('/scan');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-mark"><IconLogo color="#0d9488" width={22} height={22} /></div>
        <h2>MetroCheck</h2>
        <p className="sub">Legal Metrology compliance checker &middot; SIH 2026</p>

        <div className="auth-tabs">
          <div className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>Log in</div>
          <div className={`auth-tab${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>Create account</div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-field">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
          )}
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
          </div>
          {mode === 'register' && (
            <div className="form-field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="inspector">Field Inspector</option>
                <option value="officer">Compliance Officer</option>
              </select>
            </div>
          )}
          <button type="submit" className="primary auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

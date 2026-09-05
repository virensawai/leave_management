import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(email, password);
      if (user.role === 'hod') {
        navigate('/hod/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const BRANCH_HODS = [
    { label: 'CSE HOD (Dr. Sharma)', email: 'hod.cse@college.local' },
    { label: 'CSE(AIML) HOD (Dr. Patil)', email: 'hod.aiml@college.local' },
    { label: 'AIDS HOD (Dr. Deshmukh)', email: 'hod.aids@college.local' },
    { label: 'EXTC HOD (Dr. Kulkarni)', email: 'hod.extc@college.local' },
    { label: 'EE HOD (Dr. Verma)', email: 'hod.ee@college.local' },
    { label: 'ME HOD (Dr. Shinde)', email: 'hod.me@college.local' },
    { label: 'CIVIL HOD (Dr. Joshi)', email: 'hod.civil@college.local' },
  ];

  const setDemoCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-md shadow-indigo-600/30">
            LM
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your college leave account</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder="e.g. aarav@college.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 mt-2 cursor-pointer font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('aarav@college.local', 'Student@123')}
                className="btn btn-outline btn-sm text-xs py-2"
              >
                Student (CSE)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('tanvi.aiml@college.local', 'Student@123')}
                className="btn btn-outline btn-sm text-xs py-2"
              >
                Student (AIML)
              </button>
            </div>
            <div>
              <select
                className="form-select text-xs py-2 w-full text-slate-700 bg-slate-50 cursor-pointer"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setDemoCredentials(e.target.value, 'Admin@123');
                  }
                }}
              >
                <option value="" disabled>⚡ Fill Branch HOD Account...</option>
                {BRANCH_HODS.map((h) => (
                  <option key={h.email} value={h.email}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register as Student</Link>
        </div>
      </div>
    </div>
  );
}

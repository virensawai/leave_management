import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

export default function RegisterPage() {
  const BRANCHES = ['CSE', 'CSE(AIML)', 'AIDS', 'EXTC', 'EE', 'ME', 'CIVIL'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roll_no: '',
    section: 'A',
    department: 'CSE',
    semester: 4,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.roll_no) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register({
        ...formData,
        semester: parseInt(formData.semester, 10),
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container py-10">
      <div className="auth-card max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-md shadow-indigo-600/30">
            LM
          </div>
          <h1>Create Student Account</h1>
          <p className="subtitle">Sign up to request and track your college leaves</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group mb-3">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Rohan Verma"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="rohan@college.local"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="roll_no">Roll Number *</label>
              <input
                id="roll_no"
                name="roll_no"
                type="text"
                required
                className="form-input"
                placeholder="CS2024099"
                value={formData.roll_no}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="section">Section</label>
              <select
                id="section"
                name="section"
                className="form-select"
                value={formData.section}
                onChange={handleChange}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label" htmlFor="department">Department / Branch</label>
            <select
              id="department"
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 mt-2 cursor-pointer font-semibold"
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

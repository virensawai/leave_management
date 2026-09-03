import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { LEAVE_TYPES } from '../../utils/constants';
import { calculateDays, getErrorMessage } from '../../utils/helpers';

export default function ApplyLeave() {
  const [formData, setFormData] = useState({
    leave_type: 'sick',
    from_date: '',
    to_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const durationDays = calculateDays(formData.from_date, formData.to_date);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from_date || !formData.to_date || !formData.reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await studentAPI.submitLeave(formData);
      setSuccessMsg('Leave application submitted successfully!');
      setTimeout(() => {
        navigate('/student/my-leaves');
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">Fill out the form below to submit a formal leave request to your HOD.</p>
      </div>

      {successMsg && (
        <div className="alert alert-success mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="leave_type">Leave Type *</label>
            <select
              id="leave_type"
              name="leave_type"
              className="form-select"
              value={formData.leave_type}
              onChange={handleChange}
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label" htmlFor="from_date">From Date *</label>
              <input
                id="from_date"
                name="from_date"
                type="date"
                required
                className="form-input"
                value={formData.from_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label" htmlFor="to_date">To Date *</label>
              <input
                id="to_date"
                name="to_date"
                type="date"
                required
                min={formData.from_date || today}
                className="form-input"
                value={formData.to_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Duration Preview Banner */}
          {formData.from_date && formData.to_date && (
            <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <span className="font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Total Duration:
              </span>
              <span className="font-bold text-xs bg-white text-indigo-700 px-3 py-1 rounded-md shadow-xs border border-indigo-200">
                {durationDays > 0 ? `${durationDays} Day${durationDays > 1 ? 's' : ''}` : 'Invalid Dates'}
              </span>
            </div>
          )}

          <div className="form-group mb-0">
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label mb-0" htmlFor="reason">Reason for Leave *</label>
              <span className="text-xs text-gray-400">
                {formData.reason.length}/1000 (Min 10 characters)
              </span>
            </div>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              required
              maxLength={1000}
              placeholder="Please provide a clear and genuine reason for your leave..."
              className="form-textarea"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hodAPI } from '../../services/api';
import { formatDate, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function HodDashboard() {
  const [stats, setStats] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [rejectModal, setRejectModal] = useState({ isOpen: false, leaveId: null, reason: '', error: '', loading: false });
  const [approveModal, setApproveModal] = useState({ isOpen: false, leaveId: null, loading: false });
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, leavesRes] = await Promise.all([
        hodAPI.getDashboard(),
        hodAPI.getLeaves({ status: 'pending', limit: 5 })
      ]);
      setStats(dashRes.data.data.stats || {});
      setPendingLeaves(leavesRes.data.data.leaves || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproveModal((prev) => ({ ...prev, loading: true }));
      await hodAPI.approveLeave(approveModal.leaveId);
      setActionSuccess('Application approved successfully.');
      setApproveModal({ isOpen: false, leaveId: null, loading: false });
      fetchDashboardData();
    } catch (err) {
      setError(getErrorMessage(err));
      setApproveModal({ isOpen: false, leaveId: null, loading: false });
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) {
      setRejectModal((prev) => ({ ...prev, error: 'Rejection reason is required.' }));
      return;
    }
    if (rejectModal.reason.trim().length < 5) {
      setRejectModal((prev) => ({ ...prev, error: 'Reason must be at least 5 characters.' }));
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, loading: true, error: '' }));
      await hodAPI.rejectLeave(rejectModal.leaveId, { rejection_reason: rejectModal.reason });
      setActionSuccess('Application rejected.');
      setRejectModal({ isOpen: false, leaveId: null, reason: '', error: '', loading: false });
      fetchDashboardData();
    } catch (err) {
      setRejectModal((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
    }
  };

  if (loading) return <Spinner message="Loading HOD administration portal..." />;

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">HOD Administration Dashboard</h1>
          <p className="page-subtitle mb-0">Overview of student leave applications and pending actions.</p>
        </div>
        <Link to="/hod/leaves" className="btn btn-primary self-start sm:self-auto cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Manage All Applications
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success mb-6">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="ml-auto text-xs font-bold p-1 hover:opacity-80 cursor-pointer" aria-label="Dismiss alert">
            ✕
          </button>
        </div>
      )}

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-indigo-50 text-indigo-600 border border-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-slate-900">{stats.total || 0}</h3>
            <p>Total Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600 border border-amber-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-amber-600">{stats.pending || 0}</h3>
            <p>Pending Actions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-emerald-600">{stats.approved || 0}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600 border border-red-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-red-600">{stats.rejected || 0}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Pending Applications Requiring Review */}
      <div className="table-container">
        <div className="table-header">
          <div>
            <h2>Applications Requiring Review</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing pending requests that need your decision</p>
          </div>
          <Link
            to="/hod/leaves?status=pending"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Pending ({stats.pending || 0})</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {pendingLeaves.length === 0 ? (
          <EmptyState
            title="All caught up!"
            message="There are no pending leave requests awaiting approval."
          />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Section</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th className="text-right">Decide</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-semibold text-slate-900 whitespace-nowrap">
                      {leave.student_name}
                    </td>
                    <td className="whitespace-nowrap font-medium text-slate-600">{leave.roll_no}</td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        Section {leave.section}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-medium text-slate-800">
                      {getLeaveTypeLabel(leave.leave_type)}
                    </td>
                    <td className="whitespace-nowrap font-medium text-slate-700">
                      {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
                    </td>
                    <td className="max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/hod/leaves/${leave.id}`}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setApproveModal({ isOpen: true, leaveId: leave.id, loading: false })}
                          className="btn btn-success btn-sm text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ isOpen: true, leaveId: leave.id, reason: '', error: '', loading: false })}
                          className="btn btn-danger btn-sm text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, leaveId: null, loading: false })}
        title="Approve Leave Application"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to approve this student's leave application?
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setApproveModal({ isOpen: false, leaveId: null, loading: false })}
            className="btn btn-outline btn-sm"
            disabled={approveModal.loading}
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="btn btn-success btn-sm"
            disabled={approveModal.loading}
          >
            {approveModal.loading ? 'Approving...' : 'Confirm Approve'}
          </button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, leaveId: null, reason: '', error: '', loading: false })}
        title="Reject Leave Application"
      >
        <form onSubmit={handleReject}>
          {rejectModal.error && (
            <div className="alert alert-error mb-4">{rejectModal.error}</div>
          )}
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Please provide a specific reason for rejecting this leave application so the student is notified.
          </p>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="rejection_reason">Reason for Rejection *</label>
            <textarea
              id="rejection_reason"
              rows={3}
              required
              className="form-textarea"
              placeholder="e.g. Incomplete documentation, coincides with exams, etc."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectModal({ isOpen: false, leaveId: null, reason: '', error: '', loading: false })}
              className="btn btn-outline btn-sm"
              disabled={rejectModal.loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger btn-sm"
              disabled={rejectModal.loading}
            >
              {rejectModal.loading ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

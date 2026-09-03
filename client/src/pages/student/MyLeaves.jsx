import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { formatDate, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModal, setCancelModal] = useState({ isOpen: false, leaveId: null, loading: false });
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLeaves(pagination.page);
  }, [pagination.page]);

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await studentAPI.getMyLeaves({ page, limit: 10 });
      const data = res.data.data;
      setLeaves(data.leaves || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (leaveId) => {
    setCancelModal({ isOpen: true, leaveId, loading: false });
  };

  const confirmCancel = async () => {
    try {
      setCancelModal((prev) => ({ ...prev, loading: true }));
      await studentAPI.cancelLeave(cancelModal.leaveId);
      setActionMessage({ type: 'success', text: 'Leave application cancelled successfully.' });
      setCancelModal({ isOpen: false, leaveId: null, loading: false });
      fetchLeaves(pagination.page);
    } catch (err) {
      setActionMessage({ type: 'error', text: getErrorMessage(err) });
      setCancelModal({ isOpen: false, leaveId: null, loading: false });
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">My Leave Applications</h1>
          <p className="page-subtitle">Track the status and history of all your submitted leave requests.</p>
        </div>
        <Link to="/student/apply-leave" className="btn btn-primary self-start sm:self-auto cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Application
        </Link>
      </div>

      {actionMessage.text && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="ml-auto text-xs font-bold p-1 hover:opacity-80 cursor-pointer"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="table-container">
        {loading ? (
          <Spinner message="Loading your applications..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No applications found"
            message="You haven't submitted any leave applications yet."
            action={
              <Link to="/student/apply-leave" className="btn btn-primary btn-sm">
                Apply for Leave
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="font-semibold text-slate-900 whitespace-nowrap">
                        {getLeaveTypeLabel(leave.leave_type)}
                      </td>
                      <td className="whitespace-nowrap font-medium text-slate-700">{formatDate(leave.from_date)}</td>
                      <td className="whitespace-nowrap font-medium text-slate-700">{formatDate(leave.to_date)}</td>
                      <td className="max-w-xs truncate text-slate-600" title={leave.reason}>
                        {leave.reason}
                        {leave.status === 'rejected' && leave.rejection_reason && (
                          <span className="block text-xs text-red-600 mt-0.5 italic truncate" title={leave.rejection_reason}>
                            Reason: {leave.rejection_reason}
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge status={leave.status} />
                      </td>
                      <td className="text-slate-500 whitespace-nowrap text-xs">{formatDate(leave.created_at)}</td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/student/leaves/${leave.id}`}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            Details
                          </Link>
                          {leave.status === 'pending' && (
                            <button
                              onClick={() => handleCancelClick(leave.id)}
                              className="btn btn-danger btn-sm text-xs"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, leaveId: null, loading: false })}
        title="Cancel Leave Application"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to cancel this pending leave application? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setCancelModal({ isOpen: false, leaveId: null, loading: false })}
            className="btn btn-outline btn-sm"
            disabled={cancelModal.loading}
          >
            Keep Application
          </button>
          <button
            onClick={confirmCancel}
            className="btn btn-danger btn-sm"
            disabled={cancelModal.loading}
          >
            {cancelModal.loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

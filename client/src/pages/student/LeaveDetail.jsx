import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { formatDate, formatDateTime, calculateDays, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

export default function LeaveDetail() {
  const { id } = useParams();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchLeaveDetail();
  }, [id]);

  const fetchLeaveDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentAPI.getLeaveDetail(id);
      setLeave(res.data.data.leave);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await studentAPI.cancelLeave(id);
      setCancelModalOpen(false);
      fetchLeaveDetail();
    } catch (err) {
      setError(getErrorMessage(err));
      setCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner message="Loading application details..." />;

  if (error || !leave) {
    return (
      <div className="page-container max-w-3xl">
        <div className="alert alert-error mb-4">{error || 'Leave application not found.'}</div>
        <Link to="/student/my-leaves" className="btn btn-outline btn-sm">
          ← Back to My Leaves
        </Link>
      </div>
    );
  }

  const durationDays = calculateDays(leave.from_date, leave.to_date);

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/student/my-leaves"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-2.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Leaves
          </Link>
          <h1 className="page-title">Application #{leave.id}</h1>
          <p className="page-subtitle mb-0">Submitted on {formatDateTime(leave.created_at)}</p>
        </div>
        <div className="self-start sm:self-auto">
          <Badge status={leave.status} />
        </div>
      </div>

      {leave.status === 'rejected' && leave.rejection_reason && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-1">Rejection Reason</h4>
              <p className="text-sm text-red-700 leading-relaxed">{leave.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="detail-section">
          <h3>Leave Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Leave Type</label>
              <p>{getLeaveTypeLabel(leave.leave_type)}</p>
            </div>
            <div className="detail-item">
              <label>Total Duration</label>
              <p>{durationDays} Day{durationDays > 1 ? 's' : ''}</p>
            </div>
            <div className="detail-item">
              <label>Start Date</label>
              <p>{formatDate(leave.from_date)}</p>
            </div>
            <div className="detail-item">
              <label>End Date</label>
              <p>{formatDate(leave.to_date)}</p>
            </div>
          </div>
        </div>

        <div className="detail-section mb-0">
          <h3>Reason for Leave</h3>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
            {leave.reason}
          </p>
        </div>

        {leave.reviewed_at && (
          <div className="detail-section mt-6 pt-6 border-t border-slate-100">
            <h3>Review Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Reviewed By</label>
                <p>{leave.reviewed_by_name || 'HOD'}</p>
              </div>
              <div className="detail-item">
                <label>Reviewed On</label>
                <p>{formatDateTime(leave.reviewed_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {leave.status === 'pending' && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setCancelModalOpen(true)}
            className="btn btn-danger"
          >
            Cancel Application
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Cancellation"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to cancel this pending leave request? This action cannot be reversed.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setCancelModalOpen(false)}
            className="btn btn-outline btn-sm"
            disabled={cancelling}
          >
            Go Back
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-danger btn-sm"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

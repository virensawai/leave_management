import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hodAPI } from '../../services/api';
import { formatDate, formatDateTime, calculateDays, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

export default function HodLeaveDetail() {
  const { id } = useParams();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [approveModal, setApproveModal] = useState({ isOpen: false, loading: false });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, reason: '', error: '', loading: false });
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchLeaveDetail();
  }, [id]);

  const fetchLeaveDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hodAPI.getLeaveDetail(id);
      setLeave(res.data.data.leave);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproveModal({ isOpen: true, loading: true });
      await hodAPI.approveLeave(id);
      setActionSuccess('Application has been approved successfully.');
      setApproveModal({ isOpen: false, loading: false });
      fetchLeaveDetail();
    } catch (err) {
      setError(getErrorMessage(err));
      setApproveModal({ isOpen: false, loading: false });
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
      await hodAPI.rejectLeave(id, { rejection_reason: rejectModal.reason });
      setActionSuccess('Application has been rejected.');
      setRejectModal({ isOpen: false, reason: '', error: '', loading: false });
      fetchLeaveDetail();
    } catch (err) {
      setRejectModal((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
    }
  };

  if (loading) return <Spinner message="Loading application..." />;

  if (error || !leave) {
    return (
      <div className="page-container">
        <div className="alert alert-error mb-4">{error || 'Leave application not found.'}</div>
        <Link to="/hod/leaves" className="btn btn-outline btn-sm">
          ← Back to Applications List
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
            to="/hod/leaves"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-2.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Applications
          </Link>
          <h1 className="page-title">Application Review #{leave.id}</h1>
          <p className="page-subtitle mb-0">Submitted on {formatDateTime(leave.created_at)}</p>
        </div>
        <div className="self-start sm:self-auto">
          <Badge status={leave.status} />
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success mb-6">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="ml-auto text-xs font-bold p-1 hover:opacity-80 cursor-pointer" aria-label="Dismiss alert">
            ✕
          </button>
        </div>
      )}

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
        {/* Student Information */}
        <div className="detail-section">
          <h3>Student Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Student Name</label>
              <p>{leave.student_name}</p>
            </div>
            <div className="detail-item">
              <label>Roll Number</label>
              <p>{leave.roll_no}</p>
            </div>
            <div className="detail-item">
              <label>Section</label>
              <p>Section {leave.section}</p>
            </div>
            <div className="detail-item">
              <label>Department & Semester</label>
              <p>{leave.department} (Sem {leave.semester})</p>
            </div>
          </div>
        </div>

        {/* Leave Information */}
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
              <label>From Date</label>
              <p>{formatDate(leave.from_date)}</p>
            </div>
            <div className="detail-item">
              <label>To Date</label>
              <p>{formatDate(leave.to_date)}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="detail-section mb-0">
          <h3>Reason Submitted by Student</h3>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
            {leave.reason}
          </p>
        </div>

        {/* Audit / Review Information */}
        {leave.reviewed_at && (
          <div className="detail-section mt-6 pt-6 border-t border-slate-100">
            <h3>Decision Audit</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Reviewed By</label>
                <p>{leave.reviewed_by_name || 'HOD'}</p>
              </div>
              <div className="detail-item">
                <label>Reviewed At</label>
                <p>{formatDateTime(leave.reviewed_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons if Pending */}
      {leave.status === 'pending' && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setRejectModal({ isOpen: true, reason: '', error: '', loading: false })}
            className="btn btn-danger"
          >
            Reject Application
          </button>
          <button
            onClick={() => setApproveModal({ isOpen: true, loading: false })}
            className="btn btn-success"
          >
            Approve Application
          </button>
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, loading: false })}
        title="Approve Leave"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to approve this leave request for <span className="font-semibold text-slate-900">{leave.student_name}</span> ({leave.roll_no})?
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setApproveModal({ isOpen: false, loading: false })}
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
        onClose={() => setRejectModal({ isOpen: false, reason: '', error: '', loading: false })}
        title="Reject Leave"
      >
        <form onSubmit={handleReject}>
          {rejectModal.error && (
            <div className="alert alert-error mb-4">{rejectModal.error}</div>
          )}
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Provide a mandatory rejection reason for <span className="font-semibold text-slate-900">{leave.student_name}</span>.
          </p>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="detail_rejection_reason">Reason for Rejection *</label>
            <textarea
              id="detail_rejection_reason"
              rows={3}
              required
              className="form-textarea"
              placeholder="e.g. Leave overlaps with practical examinations..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectModal({ isOpen: false, reason: '', error: '', loading: false })}
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

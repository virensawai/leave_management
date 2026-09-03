import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { hodAPI } from '../../services/api';
import { formatDate, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import { LEAVE_TYPES, STATUS_OPTIONS, SECTION_OPTIONS } from '../../utils/constants';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function HodLeaveList() {
  const [searchParams] = useSearchParams();

  // Filters state initialized from URL search params if present
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    leave_type: searchParams.get('leave_type') || '',
    section: searchParams.get('section') || '',
    from_date: searchParams.get('from_date') || '',
    to_date: searchParams.get('to_date') || '',
  });

  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals for actions
  const [approveModal, setApproveModal] = useState({ isOpen: false, leaveId: null, loading: false });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, leaveId: null, reason: '', error: '', loading: false });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLeaves(pagination.page);
  }, [pagination.page, filters.status, filters.leave_type, filters.section]);

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      // Clean empty keys
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const res = await hodAPI.getLeaves(params);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLeaves(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      leave_type: '',
      section: '',
      from_date: '',
      to_date: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const confirmApprove = async () => {
    try {
      setApproveModal((prev) => ({ ...prev, loading: true }));
      await hodAPI.approveLeave(approveModal.leaveId);
      setSuccessMessage('Application approved successfully.');
      setApproveModal({ isOpen: false, leaveId: null, loading: false });
      fetchLeaves(pagination.page);
    } catch (err) {
      setError(getErrorMessage(err));
      setApproveModal({ isOpen: false, leaveId: null, loading: false });
    }
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) {
      setRejectModal((prev) => ({ ...prev, error: 'Rejection reason is required.' }));
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, loading: true, error: '' }));
      await hodAPI.rejectLeave(rejectModal.leaveId, { rejection_reason: rejectModal.reason });
      setSuccessMessage('Application rejected.');
      setRejectModal({ isOpen: false, leaveId: null, reason: '', error: '', loading: false });
      fetchLeaves(pagination.page);
    } catch (err) {
      setRejectModal((prev) => ({ ...prev, error: getErrorMessage(err), loading: false }));
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Leave Applications Directory</h1>
        <p className="page-subtitle mb-0">Search, filter, review, and process all student leave requests.</p>
      </div>

      {successMessage && (
        <div className="alert alert-success mb-6">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-xs font-bold p-1 hover:opacity-80 cursor-pointer" aria-label="Dismiss alert">
            ✕
          </button>
        </div>
      )}

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Filter Toolbar */}
      <div className="card mb-6 p-5">
        <form onSubmit={handleSearchSubmit} className="filters-bar mb-0">
          <div className="filter-group flex-1 min-w-[200px]">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Student name or roll no..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="section">Section</label>
            <select
              id="section"
              name="section"
              value={filters.section}
              onChange={handleFilterChange}
            >
              {SECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="leave_type">Leave Type</label>
            <select
              id="leave_type"
              name="leave_type"
              value={filters.leave_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {LEAVE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="from_date">From Date</label>
            <input
              id="from_date"
              name="from_date"
              type="date"
              value={filters.from_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="to_date">To Date</label>
            <input
              id="to_date"
              name="to_date"
              type="date"
              value={filters.to_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-center gap-2 self-end pt-1">
            <button type="submit" className="btn btn-primary btn-sm">
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-outline btn-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Leave Applications Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>
            Applications {pagination.total > 0 && <span className="text-slate-400 font-normal">({pagination.total})</span>}
          </h2>
        </div>

        {loading ? (
          <Spinner message="Loading applications..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No matching applications"
            message="Try adjusting your filters or search terms."
            action={
              <button onClick={handleResetFilters} className="btn btn-outline btn-sm">
                Reset All Filters
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Section</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
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
                      <td>
                        <Badge status={leave.status} />
                      </td>
                      <td className="text-slate-500 whitespace-nowrap text-xs">{formatDate(leave.created_at)}</td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/hod/leaves/${leave.id}`}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            Details
                          </Link>
                          {leave.status === 'pending' && (
                            <>
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
                            </>
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
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
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

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, leaveId: null, loading: false })}
        title="Approve Leave Application"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to approve this leave request?
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
            onClick={confirmApprove}
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
        <form onSubmit={confirmReject}>
          {rejectModal.error && (
            <div className="alert alert-error mb-4">{rejectModal.error}</div>
          )}
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Please provide a specific rejection reason for the student.
          </p>
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="rejection_reason_list">Rejection Reason *</label>
            <textarea
              id="rejection_reason_list"
              rows={3}
              required
              className="form-textarea"
              placeholder="e.g. Incomplete details, clashes with exam schedule..."
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

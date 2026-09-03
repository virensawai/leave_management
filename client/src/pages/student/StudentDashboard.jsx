import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { formatDate, getLeaveTypeLabel, getErrorMessage } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, leavesRes] = await Promise.all([
        studentAPI.getDashboard(),
        studentAPI.getMyLeaves({ page: 1, limit: 5 })
      ]);
      setData(dashRes.data.data);
      setRecentLeaves(leavesRes.data.data.leaves || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner message="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const { stats, student } = data || { stats: {}, student: {} };

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm border border-indigo-600/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Hello, {student?.name || 'Student'}! 👋
            </h1>
            <p className="text-indigo-200 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Roll No: <span className="font-semibold text-white">{student?.roll_no}</span></span>
              <span className="text-indigo-400">•</span>
              <span>Section: <span className="font-semibold text-white">{student?.section}</span></span>
              <span className="text-indigo-400">•</span>
              <span>{student?.department} (Sem {student?.semester})</span>
            </p>
          </div>
          <Link
            to="/student/apply-leave"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600 border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-slate-900">{stats?.total || 0}</h3>
            <p>Total Applied</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600 border border-amber-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-amber-600">{stats?.pending || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <h3 className="text-emerald-600">{stats?.approved || 0}</h3>
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
            <h3 className="text-red-600">{stats?.rejected || 0}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Recent Leave Applications</h2>
          <Link
            to="/student/my-leaves"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Applications</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentLeaves.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            message="You haven't submitted any leave applications yet."
            action={
              <Link to="/student/apply-leave" className="btn btn-primary btn-sm">
                Apply for your first leave
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-semibold text-slate-900">
                      {getLeaveTypeLabel(leave.leave_type)}
                    </td>
                    <td className="whitespace-nowrap font-medium text-slate-700">
                      {formatDate(leave.from_date)} – {formatDate(leave.to_date)}
                    </td>
                    <td className="max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td>
                      <Badge status={leave.status} />
                    </td>
                    <td className="text-slate-500 whitespace-nowrap text-xs">
                      {formatDate(leave.created_at)}
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/student/leaves/${leave.id}`}
                        className="btn btn-outline btn-sm text-xs"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

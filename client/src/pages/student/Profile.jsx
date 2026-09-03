import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, student } = useAuth();

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Your registered college profile and academic details.</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-600/20 flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{user?.name}</h2>
            <p className="text-sm text-slate-500 truncate mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-200">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="detail-section mb-0">
          <h3>Academic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Roll Number</label>
              <p>{student?.roll_no || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Section</label>
              <p>Section {student?.section || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Department</label>
              <p>{student?.department || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Current Semester</label>
              <p>Semester {student?.semester || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

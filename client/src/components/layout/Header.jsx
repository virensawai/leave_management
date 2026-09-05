import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ setIsSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700 hidden sm:inline-block tracking-tight">
          College Student Leave Management
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wider font-mono">
            {user?.role === 'hod' ? (user?.department ? `HOD • ${user.department}` : 'HOD') : 'Student'}
          </span>
          <span className="text-sm font-semibold text-gray-800 hidden sm:inline">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}

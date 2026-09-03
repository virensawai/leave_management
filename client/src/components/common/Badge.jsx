import React from 'react';

export default function Badge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'cancelled':
        return 'badge-cancelled';
      case 'pending':
      default:
        return 'badge-pending';
    }
  };

  const getDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-slate-400';
      case 'pending':
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(status)} inline-block flex-shrink-0`}></span>
      <span>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}</span>
    </span>
  );
}

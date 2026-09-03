/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a datetime string to include time.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate duration in days between two dates (inclusive).
 */
export function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

/**
 * Get a readable leave type label.
 */
export function getLeaveTypeLabel(type) {
  const labels = {
    sick: 'Sick Leave',
    casual: 'Casual Leave',
    academic: 'Academic Leave',
    family: 'Family Leave',
    other: 'Other',
  };
  return labels[type] || type;
}

/**
 * Extract error message from an Axios error response.
 */
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

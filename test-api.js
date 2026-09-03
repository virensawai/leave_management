/**
 * Automated Verification Script for College Leave Management System
 * Tests all requirements and security boundaries from project.md
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const status = res.status;
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // empty
  }
  return { status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================');
  console.log('  RUNNING COMPREHENSIVE SYSTEM INTEGRATION TESTS');
  console.log('=============================================\n');

  // --- 1. HEALTH CHECK ---
  console.log('1. Health Check Endpoint');
  const health = await request('/health');
  assert(health.status === 200 && health.data?.success === true, 'Server health check returns 200 and success');

  // --- 2. AUTHENTICATION TESTS ---
  console.log('\n2. Authentication & Authorization');
  // Invalid login
  const invalidLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hod@college.local', password: 'WrongPassword' })
  });
  assert(invalidLogin.status === 401 && invalidLogin.data?.success === false, 'Invalid credentials rejected with 401');

  // Valid HOD login
  const hodLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hod@college.local', password: 'Admin@123' })
  });
  assert(hodLogin.status === 200 && hodLogin.data?.data?.user?.role === 'hod', 'HOD login succeeds with role="hod"');
  const hodToken = hodLogin.data?.data?.token;

  // Valid Student login
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'aarav@college.local', password: 'Student@123' })
  });
  assert(studentLogin.status === 200 && studentLogin.data?.data?.user?.role === 'student', 'Student login succeeds with role="student"');
  const studentToken = studentLogin.data?.data?.token;

  // Student 2 (Priya) login for multi-tenant checks
  const priyaLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@college.local', password: 'Student@123' })
  });
  const priyaToken = priyaLogin.data?.data?.token;

  // /auth/me check
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(meRes.status === 200 && meRes.data?.data?.user?.email === 'aarav@college.local', '/auth/me returns student info and profile');

  // --- 3. SECURITY & ACCESS CONTROL ---
  console.log('\n3. Security Boundaries & Role Enforcement');
  // Unauthenticated request to protected endpoint
  const unauth = await request('/student/dashboard');
  assert(unauth.status === 401, 'Unauthenticated request to protected student endpoint rejected with 401');

  // Student hitting HOD endpoint
  const studentForbidden = await request('/hod/dashboard', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentForbidden.status === 403, 'Student hitting /api/hod/* rejected with 403 Forbidden');

  // HOD hitting Student endpoint
  const hodForbidden = await request('/student/dashboard', {
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(hodForbidden.status === 403, 'HOD hitting /api/student/* rejected with 403 Forbidden');

  // --- 4. STUDENT WORKFLOW ---
  console.log('\n4. Student Leave Workflow');
  // Dashboard stats
  const stuDash = await request('/student/dashboard', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(stuDash.status === 200 && typeof stuDash.data?.data?.stats?.total === 'number', 'Student dashboard stats retrieved successfully');

  // Submit invalid dates (start after end)
  const invalidDateSub = await request('/student/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      leave_type: 'sick',
      from_date: '2026-10-15',
      to_date: '2026-10-10',
      reason: 'Valid length reason for the leave application test.'
    })
  });
  assert(invalidDateSub.status === 400, 'Leave with from_date > to_date rejected with 400 Validation Error');

  // Submit short reason
  const shortReasonSub = await request('/student/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      leave_type: 'sick',
      from_date: '2026-10-10',
      to_date: '2026-10-12',
      reason: 'Too short'
    })
  });
  assert(shortReasonSub.status === 400, 'Leave with reason < 10 characters rejected with 400 Validation Error');

  // Submit valid leave application
  const validSub = await request('/student/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      leave_type: 'casual',
      from_date: '2026-11-01',
      to_date: '2026-11-03',
      reason: 'Attending elder brother ceremony and family celebrations.'
    })
  });
  assert(validSub.status === 201 && validSub.data?.data?.id, 'Valid leave application submitted with 201 Created');
  const newLeaveId = validSub.data?.data?.id;

  // View my leaves
  const myLeaves = await request('/student/leaves/my', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(myLeaves.status === 200 && myLeaves.data?.data?.leaves?.length > 0, 'Student views their own leave applications list');

  // View own leave detail
  const myDetail = await request(`/student/leaves/${newLeaveId}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(myDetail.status === 200 && myDetail.data?.data?.leave?.id === newLeaveId, 'Student can view details of their own application');

  // Unauthorized multi-tenant check: Student 2 (Priya) tries to access Student 1's leave
  const crossStudentAccess = await request(`/student/leaves/${newLeaveId}`, {
    headers: { Authorization: `Bearer ${priyaToken}` }
  });
  assert(crossStudentAccess.status === 403, 'Cross-student access blocked: Student 2 cannot view Student 1 leave (403)');

  // Cross-student cancel check: Student 2 tries to cancel Student 1's leave
  const crossStudentCancel = await request(`/student/leaves/${newLeaveId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${priyaToken}` }
  });
  assert(crossStudentCancel.status === 403, 'Cross-student cancel blocked: Student 2 cannot cancel Student 1 leave (403)');

  // --- 5. HOD WORKFLOW & DECISIONS ---
  console.log('\n5. HOD Review, Filter, & Approval Workflow');
  // HOD dashboard
  const hodDash = await request('/hod/dashboard', {
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(hodDash.status === 200 && hodDash.data?.data?.stats?.pending >= 1, 'HOD dashboard retrieves total and pending counts');

  // HOD list with filters
  const filteredLeaves = await request('/hod/leaves?status=pending&section=A', {
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(filteredLeaves.status === 200 && Array.isArray(filteredLeaves.data?.data?.leaves), 'HOD filters applications by status and section');

  // HOD view detail
  const hodDetail = await request(`/hod/leaves/${newLeaveId}`, {
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(hodDetail.status === 200 && hodDetail.data?.data?.leave?.student_name === 'Aarav Patel', 'HOD views leave application with full student profile data');

  // HOD reject without reason -> Must fail
  const rejectNoReason = await request(`/hod/leaves/${newLeaveId}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${hodToken}` },
    body: JSON.stringify({ rejection_reason: '' })
  });
  assert(rejectNoReason.status === 400, 'HOD rejection without reason rejected with 400 Validation Error');

  // HOD approve pending application
  const approveRes = await request(`/hod/leaves/${newLeaveId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(approveRes.status === 200, 'HOD approves pending application successfully');

  // Invalid state transition: Re-approving already approved application
  const reApprove = await request(`/hod/leaves/${newLeaveId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(reApprove.status === 400, 'State transition blocked: Cannot approve already approved application (400)');

  // Invalid state transition: Rejecting already approved application
  const rejectApproved = await request(`/hod/leaves/${newLeaveId}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${hodToken}` },
    body: JSON.stringify({ rejection_reason: 'Changed mind' })
  });
  assert(rejectApproved.status === 400, 'State transition blocked: Cannot reject already approved application (400)');

  // Student cancel test on approved application -> Must fail
  const cancelApproved = await request(`/student/leaves/${newLeaveId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(cancelApproved.status === 400, 'Student cannot cancel an already approved application (400)');

  // --- 6. HOD STUDENTS DIRECTORY ---
  console.log('\n6. HOD Students Directory');
  const studentsList = await request('/hod/students', {
    headers: { Authorization: `Bearer ${hodToken}` }
  });
  assert(studentsList.status === 200 && studentsList.data?.data?.students?.length >= 5, 'HOD views complete student directory');

  // --- 7. STUDENT CANCELLATION WORKFLOW ---
  console.log('\n7. Student Application Cancellation');
  // Submit another leave to test cancellation
  const cancelTestSub = await request('/student/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      leave_type: 'other',
      from_date: '2026-12-01',
      to_date: '2026-12-02',
      reason: 'Personal errand appointment at regional passport center.'
    })
  });
  const cancelTestId = cancelTestSub.data?.data?.id;

  // Student cancels pending leave
  const cancelRes = await request(`/student/leaves/${cancelTestId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(cancelRes.status === 200, 'Student successfully cancels their pending application');

  // Re-cancelling already cancelled leave
  const reCancelRes = await request(`/student/leaves/${cancelTestId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(reCancelRes.status === 400, 'State transition blocked: Cannot cancel already cancelled application (400)');

  console.log('\n=============================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

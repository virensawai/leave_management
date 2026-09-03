import React, { useEffect, useState } from 'react';
import { hodAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

export default function HodStudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hodAPI.getStudents();
      setStudents(res.data.data.students || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesSection = sectionFilter === '' || s.section === sectionFilter;

    return matchesSearch && matchesSection;
  });

  if (loading) return <Spinner message="Loading student records..." />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Students Directory</h1>
        <p className="page-subtitle mb-0">View all registered students across departments and sections.</p>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Search and Filters */}
      <div className="card mb-6 p-5">
        <div className="filters-bar mb-0">
          <div className="filter-group flex-1 min-w-[200px]">
            <label htmlFor="student_search">Search Student</label>
            <input
              id="student_search"
              type="text"
              placeholder="Search by name, roll no, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="student_section">Section</label>
            <select
              id="student_section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {(search || sectionFilter) && (
            <div className="self-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSectionFilter('');
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Enrolled Students ({filteredStudents.length})</h2>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            message="No students match the search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Section</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="font-semibold text-indigo-600 whitespace-nowrap">
                      {student.roll_no}
                    </td>
                    <td className="font-semibold text-slate-900 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="text-slate-600 whitespace-nowrap">{student.email}</td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        Section {student.section}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-slate-700">{student.department}</td>
                    <td className="whitespace-nowrap text-slate-700">Semester {student.semester}</td>
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
